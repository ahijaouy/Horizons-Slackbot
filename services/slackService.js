const { sendQuery } = require('./nlp');
const auth = require('./authentication');
const AUTH_PREFIX = 'https://jarvis-horizons.herokuapp.com/';

const { getResponseMessage } = require('./slackUtils');
const { responseJSON } = require('./slackInteractiveMessages');

// main message processing method called by slackrtm.js
// receives a message, checks authorization, returns sendMessage with link if user not authorized
// or returns promise chain of processing a message
processMessage = (message) => { 

    return new Promise((resolve, reject) => {
        console.log('bp 1: ', message.user);
        auth.checkUser(message.user)
        .then((authUser) => {            
            console.log('bp 2');
            if (authUser.authenticated) {
                console.log('authenticated route');

                if (authUser.pending && JSON.parse(authUser.pending).type) {
                    resolve({pending: true});                    
                } else {
                    resolve(getApiResponse(message, authUser));
                }

            } else {
                console.log('unauthenticated route');
                const msg = 'Click this link before continuing! '+AUTH_PREFIX+'connect?auth_id='+authUser._id;
                resolve({ send: msg });
            }
        });
        
    });
} 

// method that takes a message and returns objects with results from AI api
// return: object with SEND key if rtm.sendMessage is to be used, and the message as its value
// return: object with POST key if web.chat.postMessage is to be used, and msg + json as value object
getApiResponse = (message, authUser) => {
    // console.log('get api response');    

    return sendQuery(message.text, authUser._id)
        .then((response) => {
            let data = response.data;

            if (data.result.action.startsWith('smalltalk') || data.result.action.startsWith('profanity') || data.result.action.startsWith('numeric')) {
                const msg = response.data.result.fulfillment.speech;
                return { send: msg };

            } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
                // console.log('UNSPECIFIED intents');

                return {} ;

            } else if (data.result.actionIncomplete) {
                // console.log('action INCOMPLETE');
                const msg =  response.data.result.fulfillment.speech;
                return { send: msg };

            } else {
                // console.log('ACTION IS COMPLETE', data.result.parameters);
                const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
                if (data.result.parameters.time) { console.log('YOOOOOOOOOOOOOOOOOOOOOOO date in message:', data.result.parameters.time); }               
                console.log('YOOOOOOOOOOOOOOOOOOOOOOO date in message:', responseMsg);
                console.log('gar sending slackIds: ', SLACK_IDS)
                return { post: { msg: responseMsg, json: responseJSON, data: data.result, slackIds: SLACK_IDS } };
            }
        })
        .then((obj) => {
            // console.log('OBJ: ', obj);
            return new Promise(function(resolve, reject) {
                if (obj.post) {
                    if (obj.post.data.parameters.time) { console.log('YOOOOOOOOOOOOOOOOOOO date in promise of obj.post: ', obj.post.data.parameters.time)}
                    authUser.pending = JSON.stringify(Object.assign({}, obj.post.data.parameters, {slackIds: obj.post.slackIds}, {type: obj.post.data.action} ))
                    authUser.save(() => resolve(obj));
                } else {
                    resolve(obj);
                }
            });
        });
}

module.exports = { processMessage };

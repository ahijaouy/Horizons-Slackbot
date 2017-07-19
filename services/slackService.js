const { sendQuery } = require('./nlp');
const auth = require('./authentication');
const AUTH_PREFIX = 'http://localhost:3000/';

const responseJSON = {
    // "text": "*optional add text here*",
    "attachments": [
        {
            // "text": "Click to *Confirm* or *Cancel*!",
            "fallback": "[insert confirm and cancel buttons]",
            "callback_id": "something",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
                {
                    "name": "confirm",
                    "text": "Confirm",
                    "type": "button",
                    "value": "true"
                },
                {
                    "name": "confirm",
                    "text": "Cancel",
                    "type": "button",
                    "value": "false"
                }
            ]
        }
    ]
};

// method that receives an action and its parameters
// returns the return message to show in slack message about confirming reminder or meeting
getResponseMessage = (action, parameters) => {
    let returnMsg;
    if (action === 'reminder.add') {
        returnMsg = 'Creating reminder to '+parameters.subject;
    } else {
        let people = parameters['given-name'][0];
        parameters['given-name'].forEach((person, index) => {
            if (index === parameters['given-name'].length-1 && parameters['given-name'].length > 1) {
                people += ' and '+person;
            } else if (index !== 0) {
                people += ', '+person;
            }
        })
        returnMsg = 'Scheduling a meeting with '+people+' about '+parameters.subject;
    }
    returnMsg += getSlackEditableDate(parameters.date, parameters.time); 
    return returnMsg       
}

// method that takes a date from AI api and converts it to a Slack formatted date (and time)   
getSlackEditableDate = (messageDate, messageTime) => {
    console.log('received date: ', messageDate);
    let date;

    if (messageTime) {
        date = new Date(messageDate+' '+messageTime) / 1000;
        console.log('received time: ',messageTime);
        return "<!date^"+date+"^ on {date_short} at {time}|Default date: 2000-01-01 1:11:11 AM>";
    } else {
        date = new Date(messageDate) / 1000 + 86400; 
        return "<!date^"+date+"^ on {date}|Default date: 2000-01-01 1:11:11 AM>";
    }
}

// method that takes a message and returns objects with results from AI api
// return: object with SEND key if rtm.sendMessage is to be used, and the message as its value
// return: object with POST key if web.chat.postMessage is to be used, and msg + json as value object
getApiResponse = (message, authUser) => {
    console.log('get api response');

    return sendQuery(message.text, message.user)
        .then((response) => {
            let data = response.data;

            if (data.result.action.startsWith('smalltalk')) {
                console.log('responding to SMALL TALK');

                const msg = response.data.result.fulfillment.speech;
                return { send: msg };

            } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
                console.log('UNSPECIFIED intents');

                return {} ;

            } else if (data.result.actionIncomplete) {
                console.log('action INCOMPLETE');

                // INSERT CHANGE OR ADDITION OF PENDING OBJECT

                const msg =  response.data.result.fulfillment.speech;
                return { send: msg };

            } else {
                console.log('ACTION IS COMPLETE', data.result.parameters);

                // INSERT CHANGE OR ADDITION OF PENDING OBJECT         

                const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
                return { post: { msg: responseMsg, json: responseJSON, data: data.result } };
            }
        })
        .then((obj) => {
            return new Promise(function(resolve, reject) {
                if (obj.post) {
                    authUser.pending = JSON.stringify(Object.assign({}, obj.data.parameters, {type: obj.data.result.action} ))
                    authUser.save(() => {
                        resolve(obj);
                    });
                } else {
                    resolve(obj);
                }
            })
        })
}

// main method called by slackrtm.js
// receives a message, checks authorization, returns sendMessage with link if user not authorized
// or returns promise chain of processing a message
processMessage = (message) => {

    /* ****** INSERT PENDING PART :: DON'T SEND QUERY IF PENDING ****** */


    return new Promise((resolve, reject) => {
        console.log('bp 1: ', message.user);
        auth.checkUser(message.user)
        .then((authUser) => {            
            console.log('bp 2');
            if (authUser.authenticated) {
                console.log('authenticated route');
                resolve(getApiResponse(message, authUser));
            } else {
                console.log('unauthenticated route');
                const msg = 'Click this link before continuing! '+AUTH_PREFIX+'connect?auth_id='+message.user;
                resolve({ send: msg });
            }
        });
        
    });
} 

module.exports = { getApiResponse, processMessage };

/* //Process if input is Slack user id

if (message.text.indexOf('<@') >= 0) {
    console.log('recognizing user id input');
    axios.get('https://slack.com/api/users.list?token=xoxp-214075203605-214001278996-215348011622-6220a67bf54d0165d770c06e356c255a&pretty=1')
    .then((response) =>{
        console.log('*****************************************');
        console.log('axios response', response.data);

        // GET USERNAME FROM ID
        return message.text;
    })
    .then((resp) => {
        getApiResponse(message);
    });
} else { */
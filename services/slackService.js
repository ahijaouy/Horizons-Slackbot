const { sendQuery } = require('./nlp');
const auth = require('./authentication');
const AUTH_PREFIX = 'https://jarvis-horizons.herokuapp.com/';
const { findFreeTimes, checkForConflicts } = require('./conflicts');
const utils = require('./utils');

const { getResponseMessage } = require('./slackUtils');
const { responseJSON, getDropdownJson } = require('./slackInteractiveMessages');

let SLACK_IDS = [];

// main message processing method called by slackrtm.js
// receives a message, checks authorization, returns sendMessage with link if user not authorized
// or returns promise chain of processing a message
processMessage = (message, rtm) => {
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
          resolve(getApiResponse(message, authUser, rtm));
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
getApiResponse = (message, authUser, rtm) => {
  // MIDDLEWARE for messages: 
  // replace message's slack user ids with usernames; store ids into array; 
  if (message.text.indexOf('<@') >= 0) {
    message.text = message.text.replace(/<@(\w+)>/g, function(match, userId) { 
      console.log('MATCH:', match, userId, 'current slack ids: ', SLACK_IDS);
      SLACK_IDS.push(userId);
      return  rtm.dataStore.getUserById(userId).profile.real_name+', ';
    });
  }
  console.log('message: ',message);
  
  
  return sendQuery(message.text, authUser._id)
  .then((response) => {
    let data = response.data;
    
    if (data.result.action.startsWith('smalltalk') || data.result.action.startsWith('profanity') || data.result.action.startsWith('numeric')) {
      const msg = response.data.result.fulfillment.speech;
      return { send: msg };
      
    } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
      // console.log('UNSPECIFIED intents');
      
      return {} ;
      
      // handle reminder.add or meeting.add in progress
    } else if (data.result.actionIncomplete) {
      // console.log('action INCOMPLETE');
      const msg =  response.data.result.fulfillment.speech;
      return { send: msg };
      
      // handle complete reminder.add
    } else if (data.result.action === 'reminder.add') {
      // console.log('ACTION IS COMPLETE: REMINDER', data.result.parameters);
      const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
      return { post: { msg: responseMsg, json: responseJSON, data: data.result } };
      
      // handle complete meeting.add
    } else {
      console.log('ACTION IS COMPLETE: MEETING ... slack ids put into link emails', SLACK_IDS);
      
      const start = new Date(data.result.parameters.date + ' ' + data.result.parameters.time);
      /// 777600000 is 9 days in miliseconds
      const end = new Date(start.getTime() + 777600000)
      console.log('start date 1', start, 'end date 1', end);
      const duration = data.result.parameters.duration ? data.result.parameters.duration : 30
      
      return utils.linkEmails(SLACK_IDS)
      .then((attendeesObj) => {
        console.log('attendees!!', attendeesObj, 'found:', attendeesObj.found, 'not found:', attendeesObj.notFound);
        
        // all attendees have authed with google
        if (! attendeesObj.notFound.length) {
          const emails = attendeesObj.found;
          const conflict = checkForConflicts(SLACK_IDS, emails, start, end)
          const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
          
          // const conflict = true
          if(!conflict){
            console.log('no conflict');
            return { post: { msg: responseMsg, json: responseJSON, data: data.result} };
            
          } else {
            return findFreeTimes(SLACK_IDS, start, end, duration)
            .then(freeTimes => {
              console.log('REACHES free', freeTimes);
              return { post: { msg: responseMsg, json: getDropdownJson(freeTimes), data: data.result, slackIds: SLACK_IDS } };
            });
          }
          
          // not all attendees have authed with google
        } else {
          // CHECK 4 HOURS
          console.log('REACHED UNAUTH ATTENDEES');
          const isWithinFour = utils.fourHourCheck(start);
          
          if (isWithinFour) {
            const returnMsg = 'Cannot schedule! Event too soon!';
            return { send: returnMsg };
          } else {
            // tell requester that bot does not have access and will need to send request to invitees
            
            // prompt for confirmation and ask requester what to do if bot could not objtain google cal access for ALL invitees within 2 hours
            const returnMsg = 'here is where events 4+ hours later from now will be handled';
            return { send: returnMsg };
          }
        }
      });
      
      
    }
  })
  .then((obj) => {
    return new Promise(function(resolve, reject) {
      console.log('REACHES THEN 1');
      if (obj.post) {
        let userPending;
        if (SLACK_IDS) {
          userPending = Object.assign({}, obj.post.data.parameters, {slackIds: SLACK_IDS}, {type: obj.post.data.action} );
        } else {
          userPending = Object.assign({}, obj.post.data.parameters, {type: obj.post.data.action} );
        }
        authUser.pending = JSON.stringify(userPending);
        authUser.save(() => resolve(obj));
      } else {
        resolve(obj);
      }
    });
  });
}

module.exports = { processMessage };


//AMANDA'S OLD CODE:
//const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
//console.log('gar sending slackIds: ', SLACK_IDS)
//return { post: { msg: responseMsg, json: responseJSON, data: data.result, slackIds: SLACK_IDS } };
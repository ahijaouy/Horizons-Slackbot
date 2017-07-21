const { sendQuery } = require('./nlp');
const auth = require('./authentication');
const AUTH_PREFIX = 'https://jarvis-horizons.herokuapp.com/';
const { findFreeTimes, checkForConflicts } = require('./conflicts');
const utils = require('./utils');

const { getResponseMessage, getTimesForMeeting } = require('./slackUtils');
const { responseJSON } = require('./slackInteractiveMessages');
const { slackUnauth } = require('./slackUnauth');
const { slackAuth } = require('./slackAuth');

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

        if (authUser.pending && (JSON.parse(authUser.pending).type || JSON.parse(authUser.pending).newPending)) {
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
      if (SLACK_IDS.indexOf(userId) < 0) {
        SLACK_IDS.push(userId);
      }
      return  rtm.dataStore.getUserById(userId).profile.real_name+', ';
    });
  }
  console.log('message: ',message);


  return sendQuery(message.text, authUser._id)
  .then((response) => {
    let data = response.data;

    if (data.result.action.startsWith('smalltalk') || data.result.action.startsWith('profanity') || data.result.action.startsWith('numeric') || data.result.action.startsWith('ultron')) {
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
      console.log('action parameters:', data.result.parameters);

      const times = getTimesForMeeting(data.result.parameters);

      return utils.linkEmails(SLACK_IDS)
      .then((attendeesObj) => {
        console.log('attendees!!', attendeesObj, 'found:', attendeesObj.found, 'not found:', attendeesObj.notFound);

        // all attendees have authed with google
        if (! attendeesObj.notFound.length) {
          console.log('REACHED ALL AUTH ATTENDEES');
          return slackAuth(attendeesObj, SLACK_IDS, times, data);
        
          // not all attendees have authed with google
        } else {
          // CHECK 4 HOURS
          console.log('REACHED UNAUTH ATTENDEES');
          return slackUnauth(times.start, SLACK_IDS, authUser, attendeesObj);
        }
      });
    }
  })
  .then((obj) => {
    return new Promise(function(resolve, reject) {
      console.log('REACHES THEN 1');

      // message to be sent via web.chat.postMessage
      if (obj.post) {
        let userPending;

        // obj.post is from unauth route
        if (obj.post.slackIds) {
          console.log('SAVING USER PENDING WITH: ', obj.post.data, obj.post.slackIds, obj.post.data.action);
          
          userPending = Object.assign({}, obj.post.data, {slackIds: obj.post.slackIds}, {type: obj.post.data.action} );

        // obj.post is from auth route, meeting
        } else if (SLACK_IDS) {
          console.log('SAVING USER PENDING WITH: ', obj.post.data.parameters, SLACK_IDS, obj.post.data.action);
          userPending = Object.assign({}, obj.post.data.parameters, {slackIds: SLACK_IDS}, {type: obj.post.data.action} );

        // obj.post is from auth route, reminder
        } else {
          resolve(obj);
        }

        authUser.pending = JSON.stringify(userPending);
        authUser.save(() => resolve(obj));

        // message to be sent via rtm.sendMessage
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





// // DOM'S OLD CODE - NOW IN SLACKAUTH.JS
// const emails = attendeesObj.found;
// const conflict = checkForConflicts(SLACK_IDS, emails, start, end);
// const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
// return conflict.then((x) => {
//   console.log('YO THIS IS X', x);
//   if(!x.conflicts){
//     return { post: { msg: responseMsg, json: responseJSON, data: data.result} };
    
//   } else {  
//     return findFreeTimes(SLACK_IDS, start, end, duration)
//     .then(freeTimes => {
//       const timesArray = {read:[], not:[]};
//       while (timesArray.read.length < 4){
//           freeTimes.forEach((sections) => {
//               timesArray.read.push('start: ' + (sections.start.getMonth() + 1)
//               + '/' + sections.start.getDate()
//               + '/' + sections.start.getFullYear()
//               + ' at ' + (sections.start.getHours() !== 0 ? sections.start.getHours() : '12')
//               + ':' +
//               (sections.start.getMinutes() !== 0 ? sections.start.getMinutes() : '00')
//           )
//           timesArray.not.push(sections.start)

//       })
//   }
//       console.log('******', timesArray)
//       return { post: { msg: responseMsg, json: getDropdownJson(timesArray), data: data.result } };
//     })
//   };
// });
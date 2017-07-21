/* File that contains the foundation for the logic of processing an incoming message 
   Handles: filtering through types of messages, sending message to API.AI, and sending off the 
   event information received to the right path */

const { sendQuery } = require('./nlp');
const auth = require('./authentication');
const utils = require('./utils');
const AUTH_PREFIX = 'https://jarvis-horizons.herokuapp.com/';

const { findFreeTimes, checkForConflicts } = require('./conflicts');
const { getResponseMessage, getTimesForMeeting } = require('./slackUtils');
const { responseJSON } = require('./slackInteractiveMessages');
const { slackUnauth } = require('./slackUnauth');
const { slackAuth } = require('./slackAuth');

// let SLACK_IDS = [];

/********************* EXPORTED FUNCTION *********************/

// main message processing method called by slackrtm.js
// receives a message, checks authorization, returns sendMessage with link if user not authorized
// or returns promise chain of processing a message
processMessage = (message, rtm) => {
  return new Promise((resolve, reject) => {
    console.log('bp 1: ', message.user);
    auth.checkUser(message.user)
    .then((authUser) => {
      // handle authenticated user
      if (authUser.authenticated) {
        console.log('authenticated route');

         // handle user pending because of other unauth invitees
         if (authUser.pending && JSON.parse(authUser.pending).newPending) {
          const pending = JSON.parse(authUser.pending);
          console.log('reached pending with inviteees', pending);

          //remain pending if already invited invitees
          if (pending.newPending.informedInvitees) {
            console.log('no need to invite: all is good');
            resolve({pending: true});       
            
          // remain pending but also invite unauth invitees
          } else {
            console.log('reached here in pending to send out invites');
            let arrayOfInvitations = [];
            pending.unauth.attendees.notFound.forEach( invitee => {
              let msg = rtm.dataStore.getUserById(authUser.slackId).profile.real_name + "(" + authUser.email + ")";
              msg += " has invited to a meeting! Respond 'ACCEPT' to this message"
              msg += " to get the link to authenticate access to your GCal to accept or decline the invite!";
              
              arrayOfInvitations.push([invitee, msg]);
            });

            console.log('invitations:', arrayOfInvitations);            

            resolve({pending: true, invitations: arrayOfInvitations});
          }
          // resolve({pending: true, informedInvitees: pending.newPending.informedInvitees, invitees: pending.unauth.attendees.notFound });
        
        }

        // handle user pending in creating new meeting / reminder 
        else if (authUser.pending && JSON.parse(authUser.pending).type) {
          resolve({pending: true});
        
        // handle all other messages
        }  else {
          resolve(getApiResponse(message, authUser, rtm));
          console.log('reaches after resolve');
        }

      // handle unauthenticated user
      } else {
        console.log('unauthenticated route');
        const msg = 'Click this link before continuing! '+AUTH_PREFIX+'connect?auth_id='+authUser._id;
        resolve({ send: msg });
      }
    });
  });
}

/********************* LOCAL HELPER FUNCTION *********************/

// method that takes a message and returns objects with results from AI api
// return: object with SEND key if rtm.sendMessage is to be used, and the message as its value
// return: object with POST key if web.chat.postMessage is to be used, and msg + json as value object
getApiResponse = (message, authUserOuter, rtm) => {

  let SLACK_IDS = authUserOuter.slackIds;

  // MIDDLEWARE for messages:
  // replace message's slack user ids with usernames; store ids into array; save array to mongo user
  if (message.text.indexOf('<@') >= 0) {
    message.text = message.text.replace(/<@(\w+)>/g, function(match, userId) {
      console.log('MATCH:', match, userId, 'current slack ids: ', SLACK_IDS);
      if (SLACK_IDS.indexOf(userId) < 0) {
        SLACK_IDS.push(userId);
      }
      return rtm.dataStore.getUserById(userId).profile.real_name+', ';
    });
  }
  console.log('message: ',message);

  authUserOuter.slackIds = SLACK_IDS;

  let authUser;

  return authUserOuter.save() 
  .then( au => {
    authUser = au;
    return sendQuery(message.text, authUser._id)
  })
  .then( response => {
    let data = response.data;

    if (data.result.action.startsWith('smalltalk') || data.result.action.startsWith('profanity') || data.result.action.startsWith('numeric') || data.result.action.startsWith('ultron')) {
      console.log('FUN intents'); 
      const msg = response.data.result.fulfillment.speech;
      return { send: msg };

    } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
      console.log('UNSPECIFIED intents');
      const msg = "Sorry, I don't understand. Try scheduling a reminder or meeting with me!";
      return { send: msg } ;

      // handle reminder.add or meeting.add in progress
    } else if (data.result.actionIncomplete) {
      console.log('action INCOMPLETE');
      const msg =  response.data.result.fulfillment.speech;
      return { send: msg };

      // handle complete reminder.add
    } else if (data.result.action === 'reminder.add') {
      console.log('ACTION IS COMPLETE: REMINDER', data.result.parameters);
      const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
      return { post: { msg: responseMsg, json: responseJSON, data: data.result } };

      // handle complete meeting.add
    } else {
      console.log('action parameters:', data.result.parameters);
      rtm.sendMessage('Hold on... Let me check your calendars!', message.channel);

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
          console.log('REACHED UNAUTH ATTENDEES');
          return slackUnauth(times.start, SLACK_IDS, authUser, attendeesObj, data);
        }
      });
    }
  })
  .then( obj => {
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
          console.log('NOT SAVING USER PENDING, IN POST', obj);
          resolve(obj);
        }

        authUser.pending = JSON.stringify(userPending);
        authUser.save(() => resolve(obj));

        // message to be sent via rtm.sendMessage
      } else {
        console.log('NOT SAVING USER PENDING, NOT IN POST', obj);
        resolve(obj);
      }
    })
  })
  .catch( err => {
    console.log('ERROR: ', err);
  });










  // return sendQuery(message.text, authUser._id)
  // .then( response => {
  //   let data = response.data;

  //   if (data.result.action.startsWith('smalltalk') || data.result.action.startsWith('profanity') || data.result.action.startsWith('numeric') || data.result.action.startsWith('ultron')) {
  //     console.log('FUN intents');
  //     const msg = response.data.result.fulfillment.speech;
  //     return { send: msg };

  //   } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
  //     console.log('UNSPECIFIED intents');
  //     return {} ;

  //     // handle reminder.add or meeting.add in progress
  //   } else if (data.result.actionIncomplete) {
  //     console.log('action INCOMPLETE');
  //     const msg =  response.data.result.fulfillment.speech;
  //     return { send: msg };

  //     // handle complete reminder.add
  //   } else if (data.result.action === 'reminder.add') {
  //     console.log('ACTION IS COMPLETE: REMINDER', data.result.parameters);
  //     const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
  //     return { post: { msg: responseMsg, json: responseJSON, data: data.result } };

  //     // handle complete meeting.add
  //   } else {
  //     console.log('ACTION IS COMPLETE: MEETING ... slack ids put into link emails', SLACK_IDS);
  //     console.log('action parameters:', data.result.parameters);

  //     const times = getTimesForMeeting(data.result.parameters);

  //     return utils.linkEmails(SLACK_IDS)
  //     .then((attendeesObj) => {
  //       console.log('attendees!!', attendeesObj, 'found:', attendeesObj.found, 'not found:', attendeesObj.notFound);

  //       // all attendees have authed with google
  //       if (! attendeesObj.notFound.length) {
  //         console.log('REACHED ALL AUTH ATTENDEES');
  //         return slackAuth(attendeesObj, SLACK_IDS, times, data);
        
  //         // not all attendees have authed with google
  //       } else {
  //         console.log('REACHED UNAUTH ATTENDEES');
  //         return slackUnauth(times.start, SLACK_IDS, authUser, attendeesObj, data);
  //       }
  //     });
  //   }
  // })
  // .then( obj => {
  //   return new Promise(function(resolve, reject) {
  //     console.log('REACHES THEN 1');

  //     // message to be sent via web.chat.postMessage
  //     if (obj.post) {
  //       let userPending;

  //       // obj.post is from unauth route
  //       if (obj.post.slackIds) {
  //         console.log('SAVING USER PENDING WITH: ', obj.post.data, obj.post.slackIds, obj.post.data.action);
          
  //         userPending = Object.assign({}, obj.post.data, {slackIds: obj.post.slackIds}, {type: obj.post.data.action} );

  //       // obj.post is from auth route, meeting
  //       } else if (SLACK_IDS) {
  //         console.log('SAVING USER PENDING WITH: ', obj.post.data.parameters, SLACK_IDS, obj.post.data.action);
  //         userPending = Object.assign({}, obj.post.data.parameters, {slackIds: SLACK_IDS}, {type: obj.post.data.action} );

  //       // obj.post is from auth route, reminder
  //       } else {
  //         resolve(obj);
  //       }

  //       authUser.pending = JSON.stringify(userPending);
  //       authUser.save(() => resolve(obj));

  //       // message to be sent via rtm.sendMessage
  //     } else {
  //       resolve(obj);
  //     }
  //   });
  // });
}

module.exports = { processMessage };
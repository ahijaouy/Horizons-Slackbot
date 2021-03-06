const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');
const bodyParser = require('body-parser');

const calendar = require('../services/calendar');
const utils = require('../services/utils');
const {
  createGoogleReminder,
  createGoogleMeeting,
  saveReminderAndUser,
  erasePendingAndSaveUser,
  changePendingAndSaveUser
} = require('./routerHelper');

const User = require('../models/user');
const Reminder = require('../models/reminder');

/***************************** ROUTES *****************************/

router.get('/connect', (req, res) => {
  auth.generateAuthUrl(req.query.auth_id).then(url => res.redirect(url));
});

router.get('/connect/callback', (req, res) => {
  const id = JSON.parse(decodeURIComponent(req.query.state)).auth_id;
    auth.generateAuthTokens(req.query.code, id)
    .then(() => res.send('Successfully Authenticated with Google! =D'))
    .catch(() => res.send('Authentication with Google Failed! =('));
});

router.post('/slack/create_event', (req, res) => {
  const payload = JSON.parse(req.body.payload);
  const slackId = payload.user.id;

  console.log('REACHES ROUTE CREATE', req.body.payload);
  console.log('NAME OF ROUTE: ', payload.actions[0])

  User.findOne({ slackId })
    .then( user => {
       // handle unauth confirm/cancel route
    if (payload.actions[0].name === 'waitOnAttendees') {
      const requestDate = Date.now();    

      // ADD TO PENDING: onHold object:
          // boolean - jarvis has informed all unauth invitees, false       
          // boolean - user going to schedule after wait, true or false
          // date - time that request of event was made, date.now()
      if (payload.actions[0].value === 'true') {
        const newPending = { scheduleAnyway: true, requestDate, informedInvitees: false, slackId };
        changePendingAndSaveUser( res, user, newPending );

      } else {
        const newPending = { scheduleAnyway: false, requestDate, informedInvitees: false, slackId };
        changePendingAndSaveUser( res, user, newPending );

      }
    }  // close handle unauth

    else if (payload.actions[0].name === 'conflicts') {
      const eventInfo = JSON.parse(user.pending);
      const newDate = new Date(payload.actions[0].selected_options[0].value);
      eventInfo.newDate = newDate;

      createGoogleMeeting(res, eventInfo, user);
    }

    // user clicked confirm
    else if (payload.actions[0].name === 'confirm') {
      if (payload.actions[0].value === 'true') {
        const eventInfo = JSON.parse(user.pending);

        // type is reminder
        if (eventInfo.type === 'reminder.add') {
          createGoogleReminder(res, eventInfo, user);
        
          // type is meeting
        } else {
          console.log('REACHES creating meeting')
          createGoogleMeeting(res, eventInfo, user);
        }

      // user clicked cancel
      } else {
        erasePendingAndSaveUser(res, user, true);

      }
    }  // close confirm/cancel meetings
    })
    .catch( err => {
      console.log('ERROR: ', err);
    });    

  
});  //close router post

module.exports = router;




// OLD CODE:

// // find user in order to get info about current event
  // User.findOne({ slackId }, (err, user) => {
  //   console.log('BP, FOUND USER', user);
  //   if (err) {
  //     console.log('ERROR: ', err);
  //   }

  //   // handle unauth confirm/cancel route
  //   if (payload.actions[0].name === 'waitOnAttendees') {
  //     const requestDate = Date.now();    

  //     // ADD TO PENDING: onHold object:
  //         // boolean - jarvis has informed all unauth invitees, false       
  //         // boolean - user going to schedule after wait, true or false
  //         // date - time that request of event was made, date.now()
  //     if (payload.actions[0].value === 'true') {
  //       const newPending = { scheduleAnyway: true, requestDate, informedInvitees: false };
  //       changePendingAndSaveUser( res, user, newPending );

  //     } else {
  //       const newPending = { scheduleAnyway: false, requestDate, informedInvitees: false  };
  //       changePendingAndSaveUser( res, user, newPending );

  //     }
  //   }  // close handle unauth

  //   else if (payload.actions[0].name === 'conflicts') {
  //       const eventInfo = JSON.parse(user.pending);
  //       const newDate = new Date(payload.actions[0].selected_options[0].value);
  //       eventInfo.newDate = newDate;

  //       createGoogleMeeting(res, eventInfo, user);
  //   }

  //   // user clicked confirm
  //   else if (payload.actions[0].name === 'confirm') {
  //     if (payload.actions[0].value === 'true') {
  //       const eventInfo = JSON.parse(user.pending);

  //       // type is reminder
  //       if (eventInfo.type === 'reminder.add') {
  //         createGoogleReminder(res, eventInfo, user);
        
  //         // type is meeting
  //       } else {
  //         console.log('REACHES creating meeting')
  //         createGoogleMeeting(res, eventInfo, user);
  //       }

  //     // user clicked cancel
  //     } else {
  //       erasePendingAndSaveUser(res, user, true);

  //     }
  //   }  // close confirm/cancel meetings
  // });  // close find User by id
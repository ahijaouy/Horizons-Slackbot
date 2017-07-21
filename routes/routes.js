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

/***************************** Routes *****************************/

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
  
  // find user in order to get info about current event
  User.findOne({ slackId }, (err, user) => {
    console.log('BP, FOUND USER', user);
    if (err) {
      console.log('ERROR: ', err);
    }

    // handle unauth confirm/cancel route
    if (payload.actions[0].name === 'waitOnAttendees') {
      console.log('reaches unauth route in routes.js');
      const eventInfo = JSON.parse(user.pending);    
      const requestDate = Date.now();    
      
      if (payload.actions[0].value === 'true') {
        res.send("YO, you're in the SCHEDULE ANYWAY unauth route");
        console.log('event info: ', eventInfo);

        // ADD TO PENDING: onHold object:
          // boolean - user going to schedule after wait, true
          // date - time that request of event was made, date.now()
        const newPending = { scheduleAnyway: false, requestDate };
        changePendingAndSaveUser( res, user, newPending );

        // // REMOVE AFTER REAL THINGS PUT IN:
        // erasePendingAndSaveUser(res, user, true);

      } else {
        res.send("YO, you're in the CANCEL unauth route");
        console.log('event info: ', eventInfo);
        
        // ADD TO PENDING: onHold object:
          // boolean - user going to schedule after wait, false
          // date - time that request of event was made, date.now()
        const newPending = { scheduleAnyway: false, requestDate };
        changePendingAndSaveUser( res, user, newPending );

        // // REMOVE AFTER REAL THINGS PUT IN:
        // erasePendingAndSaveUser(res, user, true);

      }

    }  // close handle unauth

    else if (payload.actions[0].name === 'conflicts') {
        const eventInfo = JSON.parse(user.pending);
        console.log('***** eventInfo', eventInfo);
        console.log('payload conflicts route', payload.actions[0].selected_options)
        // DOM'S CODE
        const newDate = new Date(payload.actions[0].selected_options[0].value);
        eventInfo.newDate = newDate;
        console.log('***** eventInfo NEW', eventInfo);

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
    console.log('hit nothing')
  });  // close find User by id
});  //close router post


module.exports = router;

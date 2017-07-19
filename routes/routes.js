const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');
var bodyParser = require('body-parser');

const calendar = require('../services/calendar');
const utils = require('../services/utils');

const User = require('../models/user');
const Reminder = require('../models/reminder');

router.get('/connect', (req, res) => {
    auth.generateAuthUrl(req.query.auth_id).then(url => res.redirect(url));
});

router.get('/connect/callback', (req, res) => {
    const id = JSON.parse(decodeURIComponent(req.query.state)).auth_id;
    auth.generateAuthTokens(req.query.code, id);
    res.send('Successfully Authenticated with Google!');
});

router.post('/slack/create_event', (req, res) => { 
//   console.log('REQ', req);

  const payload = JSON.parse(req.body.payload);

  console.log('****************************')
  console.log('THIS IS PAYLOAD!!! ',payload); 
  console.log('****************************');
  console.log('payload user:', payload.user);
  if (payload.user) {console.log( payload.user.id ); }
  console.log('payload actions:', payload.actions, payload.actions[0]);
  

  User.findOne({slackId: payload.user.id}, (err, user) => {
    console.log('BP, FOUND USER', user);
    if (err) {
        console.log('ERROR: ', err);
        // return;
    } 

    // user clicked confirm
    if (payload.actions[0].value === 'true') {
        console.log('BP, CLICKED CONFIRM');
        
        const eventInfo = JSON.parse(user.pending);

        if (eventInfo.type === 'reminder.add') {
            const newReminder = new Reminder({
                subject: eventInfo.subject,
                date: eventInfo.date,
                user_id: user._id
            });

            console.log('BP, CREATED REMINDER ', newReminder);

            console.log('creating google reminder with: ',payload.user.id, new Date(eventInfo.date), eventInfo.subject);
            calendar.createReminder(payload.user.id, new Date(eventInfo.date), eventInfo.subject);

            newReminder.save((err) => {
                if (err) {
                    console.log('ERROR HERE: ',err);
                } else {
                    console.log('BP, SAVED REMINDER ');
                        
                    user.pending = JSON.stringify({});

                    user.save((err) => {
                        if (err) {
                            console.log('ERROR THERE: ',err);
                        } else {
                            console.log('BP, SAVED NEW USER ', user);
                            
                            res.send('Event created! :white_check_mark:');
                        }
                    });   // close user save
                }
            });  // close reminder save
        } else {
            user.pending = JSON.stringify({});

            console.log(user,'USER DATE: ', user.pending.date, 'USER TIME: ',user.pending.time);

            const startDate = new Date(user.pending.date + " " + payload.user.time);
            const endDate = (user.pending.duration) ? utils.getEndDate(startDate, user.pending.duration) : utils.getEndDate(startDate);
            console.log('creating google meeting with: ',payload.user.id, startDate, endDate);
            
            // const attendees = utils.linkEmails(user.pending.slackIds).found;
            
            calendar.createMeeting(payload.user.id, startDate, endDate, user.pending.subject, ['dchan331@gmail.com']);

            console.log('MEETING, NEW USER: ', user);
            user.save((err) => {
                if (err) {
                    console.log('ERROR THERE: ',err);
                } else {
                    console.log('BP, MEETING, SAVED USER ', user);
                    
                    res.send('Event created! :white_check_mark:');
                }
            });  // close user save
        } 

    //user clicked cancel
    } else {
        console.log('BP, PRESSED CANCEL')
        user.pending = JSON.stringify({});
        console.log('BP, NEW USER ', user);
        
        user.save((err) => {
            if (err) {
                console.log('ERROR THERE: ',err);
            } else {
                console.log('BP, CANCEL, SAVED USER');
                res.send('Canceled! :x:');
            } 
        }); // close user save
    }
  });  // close find User by id
});  //close router post


module.exports = router;

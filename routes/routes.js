const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');
var bodyParser = require('body-parser');

const calendar = require('../services/calendar');
const utils = require('../services/utils');

const User = require('../models/user');
const Reminder = require('../models/reminder');

/***************************** Routes *****************************/

router.get('/connect', (req, res) => {
    auth.generateAuthUrl(req.query.auth_id).then(url => res.redirect(url));
});

router.get('/connect/callback', (req, res) => {
    const id = JSON.parse(decodeURIComponent(req.query.state)).auth_id;
    auth.generateAuthTokens(req.query.code, id);
    res.send('Successfully Authenticated with Google!');
});

router.post('/slack/create_event', (req, res) => { 
    const payload = JSON.parse(req.body.payload);

    console.log('REACHES ROUTE CREATE', req.body.payload);
  
    // find user in order to get info abotu current event
    User.findOne({slackId: payload.user.id}, (err, user) => {
        console.log('BP, FOUND USER', user);
        if (err) {
            console.log('ERROR: ', err);
        }

        // user clicked confirm
        if (payload.actions[0].value === 'true') {        
            const eventInfo = JSON.parse(user.pending);

            // type is reminder
            if (eventInfo.type === 'reminder.add') {
                createGoogleReminder(eventInfo, user);
            // type is meeting
            } else {
                createGoogleMeeting(eventInfo, user);
            } 

        // user clicked cancel
        } else {
            updateAndSaveUser(user, true);
        }
    });  // close find User by id
});  //close router post



/************************ Helper Functions ************************/

// create Google reminder with date and subject
createGoogleReminder = (eventInfo, user) => {
    const newReminder = new Reminder({
        subject: eventInfo.subject,
        date: eventInfo.date,
        user_id: user._id
    });

    calendar.createReminder(payload.user.id, new Date(eventInfo.date), eventInfo.subject);
    // should chain these two once create meeting is a promise *****
    saveReminderAndUser(newReminder, user);
}

// create Google meeting with attendees, start date, end date, and subject
createGoogleMeeting = (eventInfo, user) => {
    const startDate = new Date(eventInfo.date + " " + eventInfo.time);
    const endDate = (eventInfo.duration) ? utils.getEndDate(startDate, eventInfo.duration) : utils.getEndDate(startDate);
    
    utils.linkEmails(eventInfo.slackIds)
    .then((attendeesObj) => {
        calendar.createMeeting(payload.user.id, startDate, endDate, eventInfo.subject, attendeesObj.found);
        // should chain these two once create meeting is a promise *****
        updateAndSaveUser(user, false);
    });
}

// save a new Reminder to mongoDb then call to save user with empty pending state
saveReminderAndUser = (newReminder, user) => {
    newReminder.save((err) => {
        if (err) {
            console.log('ERROR HERE: ',err);
        } else {
            console.log('BP, SAVED REMINDER ');   
            updateAndSaveUser(user, false);
        }
    });
}

// set user pending state to empty object and then save updated user to mongoDb
updateAndSaveUser = (user, canceled) => {
    user.pending = JSON.stringify({});
    
    user.save((err) => {
        if (err) {
            console.log('ERROR THERE: ',err);
        } else {
            console.log('BP, CANCEL, SAVED USER');
            if (canceled) {
                res.send('Canceled! :x:');
            } else {
                res.send('Event created! :white_check_mark:');                
            }
        } 
    }); // close user save
}



module.exports = router;






// OLD MESSY BUT WORKING WAY:
//   User.findOne({slackId: payload.user.id}, (err, user) => {
//     console.log('BP, FOUND USER', user);
//     if (err) {
//         console.log('ERROR: ', err);
//         // return;
//     } 

//     // user clicked confirm
//     if (payload.actions[0].value === 'true') {
//         console.log('BP, CLICKED CONFIRM');
        
//         const eventInfo = JSON.parse(user.pending);

//         if (eventInfo.type === 'reminder.add') {
//             const newReminder = new Reminder({
//                 subject: eventInfo.subject,
//                 date: eventInfo.date,
//                 user_id: user._id
//             });

//             console.log('BP, CREATED REMINDER ', newReminder);
            

//             newReminder.save((err) => {
//                 if (err) {
//                     console.log('ERROR HERE: ',err);
//                 } else {
//                     console.log('BP, SAVED REMINDER ');
                        
//                     user.pending = JSON.stringify({});

//                     user.save((err) => {
//                         if (err) {
//                             console.log('ERROR THERE: ',err);
//                         } else {
//                             console.log('BP, SAVED NEW USER ', user);
                            
//                             res.send('Event created! :white_check_mark:');
//                         }
//                     });  // close user save
//                 }
//             });  // close reminder save
//         } else {
//             user.pending = JSON.stringify({});
//             console.log('MEETING, NEW USER: ', user);
//             user.save((err) => {
//                 if (err) {
//                     console.log('ERROR THERE: ',err);
//                 } else {
//                     console.log('BP, MEETING, SAVED USER ', user);
                    
//                     res.send('Event created! :white_check_mark:');
//                 }
//             });  // close user save
//         } 

//     //user clicked cancel
//     } else {
//         console.log('BP, PRESSED CANCEL')
//         user.pending = JSON.stringify({});
//         console.log('BP, NEW USER ', user);
        
//         user.save((err) => {
//             if (err) {
//                 console.log('ERROR THERE: ',err);
//             } else {
//                 console.log('BP, CANCEL, SAVED USER');
//                 res.send('Canceled! :x:');
//             } 
//         }); // close user save
//     }
//   });  // close find User by id
// });  //close router post



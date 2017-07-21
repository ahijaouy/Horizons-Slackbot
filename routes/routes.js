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
  erasePendingAndSaveUser 
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
  
  // find user in order to get info abosut current event
  User.findOne({ slackId }, (err, user) => {
    console.log('BP, FOUND USER', user);
    if (err) {
      console.log('ERROR: ', err);
    }

    // handle unauth confirm/cancel route
    if (payload.actions[0].name === 'waitOnAttendees') {
      console.log('reaches unauth route in routes.js');

      if (payload.actions[0].value === 'true') {
        res.send("YO, you're in the SCHEDULE ANYWAY unauth route");

      } else {
        res.send("YO, you're in the CANCEL unauth route");
        
      }




    }  // close handle unauth

    else if (payload.actions[0].name === 'conflicts') {
        console.log('payload conflicts route', payload.actions)
      // DOM'S CODE
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

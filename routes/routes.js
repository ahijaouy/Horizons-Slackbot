const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');
var bodyParser = require('body-parser');

const calendar = require('../services/calendar');
const utils = require('../services/utils');

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

  console.log('****************************')
  console.log('THIS IS PAYLOAD!!! ',payload); 
  console.log('****************************');

  User.findById(payload.user.id, (user, err) => {

    if (payload.actions[0].value === 'true') {
        if (err) {
            console.log('ERROR: ',err);
        } else {
            const eventInfo = JSON.parse(authUser.pending);

            if (eventInfo.type === 'reminder.add') {
                const newReminder = new Reminder({
                    subject: eventInfo.subject,
                    date: eventInfo.date,
                    user_id: user._id
                });

                newReminder.save((err) => {
                    if (err) {
                        console.log('ERROR HERE: ',err);
                    } else {
                        user.pending = JSON.stringify({});

                        user.save((err) => {
                            if (err) {
                                console.log('ERROR THERE: ',err);
                            } else {
                            res.send('Event created! :white_check_mark:');
                            }
                        });  // close user save
                    }
                });  // close reminder save
            } else {
                user.pending = JSON.stringify({});
                user.save((err) => {
                    if (err) {
                        console.log('ERROR THERE: ',err);
                    } else {
                    res.send('Event created! :white_check_mark:');
                    }
                });  // close user save
            } 
        }  
    } else {
        user.pending = JSON.stringify({});
        user.save((err) => {
            if (err) {
                console.log('ERROR THERE: ',err);
            } else {
                res.send('Canceled! :x:');
            } 
        }); // close user save
    }
  });  // close find User by id
});  //close router post


module.exports = router;

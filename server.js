const express = require('express');
const mongoose = require('mongoose');
const dbconfig = require('./config/database');
/// added by dom///
const Reminder = require('./models/reminder')
const User = require('./models/user')
const remindFinder = require('./services/reminderFinder')
const _ = require('underscore')
///

const app = express();
const { rtm, web } = require('./services/slackrtm');
const routes = require('./routes/routes');


const nlp = require('./services/nlp');
//handle all the routes
app.use('/', routes);


mongoose.connect(dbconfig.url);

///Amanda needs to user this to make new reminders
// const newReminder = new Reminder ({
//     subject: "eat me",
//     date: new Date(),
//     user_id: "596e83742e70284cc0ff8b2f"
// })
// newReminder.save((err) => {
//     if(err){console.log(err)}
// })



// const auth = require('./services/authentication');
//auth.userRegistered('ANDREH').then(console.log).catch(console.log);
// auth.checkUser('ANDREH1').then(resp => console.log(resp)).catch(err => console.log('ERROR: ', err));
// auth.userAuthenticated('ANDREH1').then(resp => console.log(resp));

//start the server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
})
//rtm.start();`

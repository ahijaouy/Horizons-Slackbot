// NPM Packages
const express = require('express');
const mongoose = require('mongoose');
const dbconfig = require('./config/database');

// /// added by dom///
// const Reminder = require('./models/reminder')
// const User = require('./models/user')
// const remindFinder = require('./services/reminderCronJob')
// const _ = require('underscore')
// ///

const app = express();
var bodyParser = require('body-parser');

// Local Imports
const { rtm, web } = require('./services/slackrtm');
const dbconfig = require('./config/database');
const routes = require('./routes/routes');
var bodyParser = require('body-parser');

// Routes
app.use('/', routes);

// Database Connection
mongoose.connect(dbconfig.url);

// Start Server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
});

// Start Slack Websockets
rtm.start();

// NPM Packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Local Imports
const { rtm, web } = require('./services/slackrtm');
const routes = require('./routes/routes');
const dbconfig = require('./config/database');


// Global Variables
const app = express();
const port = process.env.PORT || 3000

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes
app.use('/', routes);

mongoose.connect(dbconfig.url);

// TESTING CONFLICTS

// const conflicts = require('./services/conflicts');
// const slackIds = ['U6AQMP8B0', 'U6A0186VA'];
// const emails = ['hijaouya@gmail.com', 'amanda.hansen@yale.edu', ];
// const start = new Date('2017-07-21T01:00:00Z');
// const end = new Date('2017-07-21T02:00:00Z');
// console.log('START TIME: ', start.toLocaleString());

// conflicts.checkForConflicts(slackIds, emails, start, end)
//     .then(console.log);

// Start Server
app.listen(port, function() {
    console.log('Server Listening on port ' + port);
});

// Start Slack Websockets
rtm.start();

// NPM Packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Local Imports
const { rtm, web } = require('./services/slackrtm');
const dbconfig = require('./config/database');
const routes = require('./routes/routes');

// Global Variables
const app = express();
const port = process.env.PORT || 3000

// Routes
app.use('/', routes);

// TESTING
const conflicts = require('./services/conflicts');

const slackIds = ['U6A0186VA','U6AQMP8B0'];
const start = '2017-07-20T15:30:00';
const end = '2017-07-29T15:30:00';
conflicts.findFreeTimes(slackIds, start, end)
  .then(console.log)

// Database Connection
mongoose.connect(dbconfig.url);

// Start Server
app.listen(port, function() {
    console.log('Server Listening on port ' + port);
});

// Start Slack Websockets
// rtm.start();

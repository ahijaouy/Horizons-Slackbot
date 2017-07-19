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

// Database Connection
mongoose.connect(dbconfig.url);


// TESTING
const andre = 'U6AQMP8B0';
const calendar = require('./services/calendar');
calendar.checkFreeBusy(andre, 'hijaouya@gmail.com', "2017-07-19T07:00:00.000Z", "2017-07-22T07:00:00.000Z" )
    .then(console.log);
// Start Server
app.listen(port, function() {
    console.log('Server Listening on port ' + port);
});

// Start Slack Websockets
//rtm.start();

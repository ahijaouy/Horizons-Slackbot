// NPM Packages
const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Local Imports
const { rtm, web } = require('./services/slackrtm');
const dbconfig = require('./config/database');
const routes = require('./routes/routes');


// Routes
app.use('/', routes);

// Database Connection
mongoose.connect(dbconfig.url);

// Start Server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
});

// Start Slack Websockets
//rtm.start();
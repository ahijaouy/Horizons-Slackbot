const express = require('express');

const app = express();
const { rtm, web } = require('./services/slackrtm');
const routes = require('./routes/routes');


const nlp = require('./services/nlp');
//handle all the routes
app.use('/', routes);

// rtm.start();

//start the server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
})
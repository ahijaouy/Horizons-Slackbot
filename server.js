const express = require('express');

const app = express();
const slackRTM = require('./services/slackrtm');
const routes = require('./routes/routes.js');

//run slack RTM file
slackRTM();

//handle all the routes
app.use('/', routes);


//start the server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
})
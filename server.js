const express = require('express');
const mongoose = require('mongoose');
const dbconfig = require('./config/database');


const app = express();
const { rtm, web } = require('./services/slackrtm');
const routes = require('./routes/routes');


const nlp = require('./services/nlp');
//handle all the routes
app.use('/', routes);


mongoose.connect(dbconfig.url);

const auth = require('./services/authentication');
//auth.userRegistered('ANDREH').then(console.log).catch(console.log);
//auth.checkUser('ANDREH2').then(resp => console.log(resp)).catch(err => console.log('ERROR: ', err));  
// auth.userAuthenticated('ANDREH1').then(resp => console.log(resp));

//start the server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
})
//rtm.start();
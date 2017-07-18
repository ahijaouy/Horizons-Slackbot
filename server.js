const express = require('express');

const app = express();
const slackRTM = require('./services/slackrtm');
const routes = require('./routes/routes.js');

//run slack RTM file
slackRTM();

const nlp = require('./services/nlp');
nlp();
//handle all the routes
app.use('/', routes);

//handle Slack button press:
app.post('/slack/interacive', (req, res) => {
    //server handles request of Confirm/Cancel reminder
    console.log(JSON.parse(req.body.payload));
    if (req.body.payload.actions[0].value === 'true') {
        res.send('Created reminder! :white_check_mark:');
    } else {
        res.send('Canceled! :x:');
    }
});

//start the server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
})
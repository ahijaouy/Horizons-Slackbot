const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');
var bodyParser = require('body-parser');

const calendar = require('../services/calendar');
const utils = require('../services/utils');

router.get('/connect', (req, res) => {
    res.redirect(auth.generateAuthUrl(req.query.auth_id));
});

router.get('/connect/callback', (req, res) => {
    const id = JSON.parse(decodeURIComponent(req.query.state)).auth_id;
    auth.generateAuthTokens(req.query.code, id);
    res.send('Successfully Authenticated with Google!');
});

router.post('/slack/create_event', (req, res) => {
  const payload = JSON.parse(req.body.payload);

  console.log('****************************')
  console.log('THIS IS PAYLOAD!!! ',payload); 
  console.log('****************************');

  if (payload.actions[0].value === 'true') {
      res.send('Event created! :white_check_mark:');
  } else {
      res.send('Canceled! :x:');
  }
});


module.exports = router;

const User = require('../models/user')
const { rtm } = require('./slackrtm');
const { CLIENT_EVENTS } = require('@slack/client');

mongoose.connect(require('../config/database').url);
mongoose.Promise = global.Promise;


rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {

  promiseChainOfEvents()
  .then(() => {
    console.log('we are done');
    process.exit(1);
  })
});

rtm.start();

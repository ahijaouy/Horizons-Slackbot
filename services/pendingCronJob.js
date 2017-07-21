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
  });
});

rtm.start();



// get all users
// for each user:
  // check if user.pending is not empty object (json.parse user.pending) and user.pending.newPending exists
    // do nothing for this user if empty obj
    // else (have user.pending.newPending)
      // call LINK EMAILS with the pending.unauth.attendees.notFound
        // if no one else found && still less than 2 hours, stop code
        // if no one else found && equal to or greater than 2 hours, SCHEDULE or CANCEL
          // based on user.pending.newPending.scheduleAnyway
        // if new ppl found --> concatenate user.pending.unauth.attendes.found with these new found ppl
          // if everyone found SCHEDULE EVENT
          // if still people unfound, && still less than 2 hours, stop code 
          // if still people unfound && equal to or greater than 2 hours, SCHEDULE or CANCEL


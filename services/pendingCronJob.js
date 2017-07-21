const User = require('../models/user')
const { rtm } = require('./slackrtm');
const { CLIENT_EVENTS } = require('@slack/client');
const mongoose = require('mongoose')
const _ = require('underscore')

mongoose.connect(require('../config/database').url);
mongoose.Promise = global.Promise;

function findUser(){
    return new Promise(function(resolve, reject){
        User.find({}).exec()
        .then(users => {
            console.log('in here', users.length)

            const pendingArray = []
            users.forEach((user, index) => {
                // console.log('user', index)
                const pending = user.pending ? JSON.parse(user.pending): false
                if(pending && !_.isEmpty(pending && pending.newPending)){
                    console.log('user',pending)
                    pendingArray.push(pending)
                }
                // console.log('what is happening')
                // if (index === users.length - 1) {
                //     return (pendingArray);
                // }
            })
            console.log('PA', pendingArray)
            resolve(pendingArray)
        })
        // .then(array => {
        //     resolve(array)
        // })
        .catch((err) => {
            reject(err)
        })
    })
}

// rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
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

  findUser()
  .then((newPending) => {
    const pendTime = new Date(newPending.requestDate)
    console.log('we are done', pendTime);
    // if()
    process.exit(0);
  });
// });

// rtm.start();

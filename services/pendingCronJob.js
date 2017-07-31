/* File that includes the Cron Job for Heroku Scheduler to run once every ten minutes
checks if unauth users have accepted; schedules events or sends messages accordingly */

const User = require('../models/user')
const { rtm, web } = require('./slackrtm');
const { CLIENT_EVENTS } = require('@slack/client');
const mongoose = require('mongoose');
const _ = require('underscore');
const utils = require('./utils');
const { slackAuth } = require('./slackAuth');
const { getTimesForMeeting } = require('./slackUtils');


mongoose.connect(require('../config/database').url);
mongoose.Promise = global.Promise;

function findUser(){
  return new Promise(function(resolve, reject){
    User.find({}).exec()
    .then(users => {
      const pendingArray = []
      users.forEach((user, index) => {
        const pending = user.pending ? JSON.parse(user.pending): {};
        if(pending && !_.isEmpty(pending) && pending.newPending){
          console.log('user',pending);
          pendingArray.push(pending);
        }
      })
      console.log('PA', pendingArray);
      resolve(pendingArray);
    })
    .catch((err) => {
      reject(err);
    });
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

  function removeExpire(array){
    const validatedArray = []
    array.forEach((pendState) =>{
      const pendTime = pendState.newPending.requestDate
      const difference = new Date().getTime() - pendTime
      console.log('difference', difference)
      if ( difference < 7200000 && difference > 0){
        validatedArray.push(pendState)
      } else {
        let postMsg = 'Two hours has passed! Continue with ';
        postMsg += (pendState.newPending.scheduleAnyway) ? 'scheduling ' : 'canceling ';
        postMsg += 'the event?';

        // const times = getTimesForMeeting(data.result.parameters);
        // slackAuth.
        //// do whatever you need to when 2 hours is exceeded
      }
    })
    console.log(' NA', validatedArray)
    return validatedArray
  }

  function checkNotFound(array){
    return new Promise(function(resolve, reject){
      array.forEach((currentUser) => {
        const notFound = currentUser.unauth.attendees.notFound;
        if(notFound.length > 0){
          console.log('yo1', notFound)
          resolve(utils.linkEmails(notFound))
        }
      })
    })
  }

  // rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {

  let VA;
  findUser()
  .then((pendingArray) => {
    return removeExpire(pendingArray)
  })
  .then((validatedArray) => {
    VA = validatedArray
    return checkNotFound(validatedArray)

  })
  .then((emailList) => {
    if(emailList.notFound){
      VA.forEach((pend, index) => {
        console.log('index', index)
        pend.unauth.attendees.found = pend.unauth.attendees.found.concat(emailList.found)
        pend.unauth.attendees.notFound = emailList.notFound
        console.log('herei am', pend.unauth.attendees, String(pend.newPending.slackId))
        // console.log('user', User);
        User.find({slackId: pend.newPending.slackId}).exec()
        .then((user) => {
          console.log('im here')
          user.pending = JSON.stringify(pend)
          console.log('user new', user)
          user.save()
          return
        })
        .catch((err) => {
          console.log('error', err)
        })
      })
    }else{
      ///// send schedule since everyone has authenticated
    }
  })
  .then((x) => {
    console.log('I am done')
    process.exit(0)
  })



  // rtm.start();

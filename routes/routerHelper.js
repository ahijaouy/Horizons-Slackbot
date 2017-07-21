/************** File with Helper Functions for Routes.js (pronounced rOOOOtes) ***************/

const utils = require('../services/utils');
const calendar = require('../services/calendar');
const mongoose = require('mongoose');
const User = require('../models/user');
const Reminder = require('../models/reminder');

// create Google reminder with date and subject
createGoogleReminder = (res, eventInfo, user) => {
  const newReminder = new Reminder({
    subject: eventInfo.subject,
    date: eventInfo.date,
    user_id: user._id
  });

  calendar.createReminder(user.slackId, new Date(eventInfo.date), eventInfo.subject);
  // should chain these two once create meeting is a promise *****
  saveReminderAndUser(res, newReminder, user);
}

// create Google meeting with attendees, start date, end date, and subject
createGoogleMeeting = (res, eventInfo, user) => {
  
  let startDate = (eventInfo.newDate) ? eventInfo.newDate : new Date(eventInfo.date + " " + eventInfo.time);
  // // HARD CODE IN ADDITION OF SEVEN HOURS
  // startDate.setHours(startDate.getHours() + 7);

  console.log('REACHES creating meeting method  : startDate: ', startDate);
  console.log('could hard code start date to be: ', startDate.getHours() + 7);
  
  const endDate = (eventInfo.duration) ? utils.getEndDate(startDate, eventInfo.duration) : utils.getEndDate(startDate);

  utils.linkEmails(eventInfo.slackIds)
  .then((attendeesObj) => {
    console.log('REACHES getting emails for calendar')

    return calendar.createMeeting(user.slackId, startDate, endDate, eventInfo.subject, attendeesObj.found);
  })
  .then(() => {
    erasePendingAndSaveUser(res, user, false);    
  })
  .catch(err => {
    console.log(err);
  })
}

// save a new Reminder to mongoDb then call to save user with empty pending state
saveReminderAndUser = (res, newReminder, user) => {
  newReminder.save( err => {
    if (err) {
      console.log('ERROR HERE: ',err);
    } else {
      console.log('BP, SAVED REMINDER ');
      erasePendingAndSaveUser(res, user, false);
    }
  });
}

// set user pending state to empty object and then save updated user to mongoDb
erasePendingAndSaveUser = (res, user, canceled) => {
  user.pending = JSON.stringify({});
  user.slackIds = [];

  return user.save()
    .then( savedUser => {
      console.log('BP, SAVED USER');
      if (canceled) {
        res.send('Canceled! :x:');
      } else {
        res.send('Event created! :white_check_mark:');
      }
    })
    .catch( err => {
      console.log('ERROR: ', err);
    });

  // user.save((err) => {
  //   if (err) {
  //     console.log('ERROR THERE: ',err);
  //   } else {
  //     console.log('BP, SAVED USER');
  //     if (canceled) {
  //       res.send('Canceled! :x:');
  //     } else {
  //       res.send('Event created! :white_check_mark:');
  //     }
  //   }
  // }) // close user save
  
}

// set user pending state to be same object with additional info about pending authorization
changePendingAndSaveUser = (res, user, newPending) => {
  console.log('BP, REACHED USER to CHANGE PENDING');
  
  const userPending = JSON.parse(user.pending);
  userPending.newPending = newPending;
  user.pending = JSON.stringify(userPending);
  
  return user.save()
    .then( savedUser => {
      console.log('BP, SAVED USER with CHANGED PENDING');
      if (userPending.newPending.scheduleAnyway) {
        const sendMsg = 'Invitations sent! I will schedule the meeting anyway with those who authorize. Check back in two hours!';
        res.send(sendMsg);
      } else {
        const sendMsg = 'Invitations sent! If not all authorize calendar access, I will cancel the meeting. Check back in two hours!';        
        res.send(sendMsg);
      }
    })
    .catch( err => {
      console.log('ERROR: ', err);      
    });
}

module.exports = { 
  createGoogleReminder,
  createGoogleMeeting,
  saveReminderAndUser,
  erasePendingAndSaveUser,
  changePendingAndSaveUser
}
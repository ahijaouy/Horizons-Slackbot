/* File that includes the Cron Job for Heroku Scheduler to run once a day
  sends out messages to every user with their reminders for today and tomorrow */

const Reminder = require('../models/reminder')
const User = require('../models/user')
const mongoose = require('mongoose')

const _ = require('underscore')
const { rtm } = require('./slackrtm');
const { CLIENT_EVENTS } = require('@slack/client');

console.log('this ran!!!');

mongoose.connect(require('../config/database').url);
mongoose.Promise = global.Promise;

function finalList(model, reminders){
  return new Promise((resolve, reject) => {
    model.find().exec()
    .then((users) => {
      let finalObj = {};
      users.forEach( (user) => {
        const slackId = user.slackId
        if(!finalObj[slackId]) {
          // finalObj[slackId] = { today: [], tomorrow: []}
          finalObj[slackId] = {}
        }
      })
      const today = appendRemind(finalObj, reminders, 'today')
      const tomorrow = appendRemind(today, reminders, 'tomorrow')
      resolve(tomorrow);
    })
  })
}

function appendRemind(obj, reminder, current){
  const day = reminder[current];
  for(var key in obj){
    for(var key2 in day){
      if(key === key2){
        if(current === 'today'){
          obj[key].today = day[key2]
        }else{
          obj[key].tomorrow = day[key2]
        }
      }
    }
  }
  return obj
}

function findDateMatches(date, array) {
  let matchedDates = [];
  array.forEach( task => {
    const taskDate = task.date
    if(taskDate.getYear() === date.getYear() && taskDate.getMonth() === date.getMonth()){
      if(task.date.getDate() === date.getDate() ){
        matchedDates.push(task)
      }
    }
  })
  return matchedDates;
}

function reminderFinder(model){
  return new Promise((resolve, reject) => {
    model.find({})
    .populate('user_id')
    .then((reminders, err) => {
      if (err) reject(err);
      const toReturn = {};
      const today = new Date();
      let tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      toReturn.today = findDateMatches(today, reminders)
      toReturn.tomorrow = findDateMatches(tomorrow, reminders);
      resolve(toReturn);
    })
    .catch(reject);
  })
}

function reminderGrouper(response){
  const groupObj = {};
  const todayGroup = _.groupBy(response['today'], (array) => {
    return array.user_id.slackId
  })
  groupObj.today = todayGroup
  const tomorrowGroup = _.groupBy(response['tomorrow'], (array) => {
    return array.user_id.slackId
  })
  groupObj.tomorrow = tomorrowGroup
  return groupObj
}

function daySort(obj, day){
  let dayArray = []
  for(var key in obj){
    const current = obj[key]
    const currentDay = current[day]
    let dayObj = {}
    let tempArray = []
    if(currentDay){
      currentDay.forEach((reminder) => {
        const SlackId = reminder.user_id.slackId;
        tempArray.push(reminder.subject);
        dayObj[SlackId] = tempArray
      })
    }
    if(!_.isEmpty(dayObj)){
      dayArray.push(dayObj)
    }
  }
  return dayArray;
}

console.log('reminder schema', Reminder)

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  reminderFinder(Reminder)
  .then(reminderGrouper(response))
  .then(resp => finalList(User, resp))
  .then(resp2 => {
    const today =  daySort(resp2, 'today')
    const tomorrow = daySort(resp2, 'tomorrow')
    return {today, tomorrow}
  })
  .then(resp3 => {
    if (!resp3 || !resp3.today || !resp3.tomorrow) {
      console.log('ERROR in Reminder Cron Job arund line 128');
      return;
    }
    var arr = [];
    console.log('resp 3 today', resp3.today)
    resp3.today.forEach((user, index) => {
      for (var id in user) {
        var dm = rtm.dataStore.getDMByUserId(id);
        arr.push(rtm.sendMessage('reminders for today:', dm.id));
        user[id].forEach((task) => {
          console.log(task)
          console.log(String(dm.id) ==='D6A07ERGU' );
          // 'D6A07ERGU'
          // D6A07ERGU
          // rtm.sendMessage(task, rtm.dataStore.getDMByUserId(id).id);
          arr.push(rtm.sendMessage('* '+task, dm.id));
        });
      }
    })

    console.log('resp 3 tomorrow', resp3.tomorrow)
    resp3.tomorrow.forEach((user) => {
      console.log(resp3.tomorrow);
      for (var id in user) {
        var dm = rtm.dataStore.getDMByUserId(id);
        arr.push(rtm.sendMessage('reminders for tomorrow:', dm.id));
        user[id].forEach((task) => {
          console.log(task)
          // rtm.sendMessage(task, rtm.dataStore.getDMByUserId(id).id);
          arr.push(rtm.sendMessage('* '+task, dm.id));
        });
      }
    })
    return Promise.all(arr);
  })
  .then(() => {
    console.log('we are done');
    process.exit(1);
  })
});

rtm.start();

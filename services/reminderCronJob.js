const Reminder = require('../models/reminder')
const User = require('../models/user')
const mongoose = require('mongoose')

const _ = require('underscore')

////
const { rtm } = require('./slackrtm');
///

mongoose.Promise = global.Promise;

function finalList(model, reminders){
    return new Promise(function(resolve, reject) {
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
    array.forEach((task, index) => {
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
    return new Promise(function(resolve, reject) {
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
        .catch((err) => {
            console.log('error', err)
        })
    })
}

function reminderGrouper(response){
    const groupObj = {};
    const todayGroup = _.groupBy(response['today'], function(array){
        return array.user_id.slackId
    })
    groupObj.today = todayGroup
    const tomorrowGroup = _.groupBy(response['tomorrow'], function(array){
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

function emitReminders(){

}


reminderFinder(Reminder)
    .then(result => {
        return result
    })
    .then(response => {
        return reminderGrouper(response)
    })
    .then(resp => {
        console.log('aaa');
        return finalList(User, resp)
    })
    .then(resp2 => {
        // console.log('resp 2', resp2)
        const todaySort =  daySort(resp2, 'today')
        const tomorrowSort = daySort(resp2, 'tomorrow')
        return {today: todaySort, tomorrow: tomorrowSort}
    })
    .then(resp3 => {
        if (! resp3 || !resp3.today || !resp3.tomorrow) {
            console.log('ERROR');
            return;
        }
        console.log('resp 3 today', resp3.today)
        resp3.today.forEach((user) => {
            rtm.sendMessage('reminders for today:');
            resp3.today[user].forEach((task) => {
                rtm.sendMessage(task, user);
            });
        })
        console.log('resp 3 tomorrow', resp3.tomorrow)
        resp3.tomorrow.forEach((user) => {
            rtm.sendMessage('reminders for tomorrow:');
            resp3.tomorrow[user].forEach((task) => {
                rtm.sendMessage(task, user);
            });
        })
    });


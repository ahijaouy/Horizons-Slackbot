const Reminder = require('../models/reminder')
const User = require('../models/user')
const mongoose = require('mongoose')

const _ = require('underscore')

mongoose.Promise = global.Promise;

function finalList(model, reminders){
    return new Promise(function(resolve, reject) {
        model.find().exec()
        .then((users) => {
            let finalObj = {};
            users.forEach( (user) => {
                const slackId = user.slackId
                if(!finalObj[slackId]) {
                    finalObj[slackId] = { today: [], tomorrow: []}
                }
            })
            const final = appendRemind(finalObj, reminders)
            resolve(final);
        })
    })
}

function appendRemind(obj, reminder){
    const today = reminder['today'];
    const tomorrow = reminder['tomorrow'];
    for(var key in obj){
        for(var key2 in today){
            for(var key3 in tomorrow){
                if(key === key2){
                    obj[key].today = today[key2]
                }else if( key === key3){
                    obj[key].tomorrow = tomorrow[key3]
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

reminderFinder(Reminder)
    .then(result => {
        return result
    })
    .then(response => {
        return reminderGrouper(response)
    })
    .then(resp => {
        return finalList(User, resp)
    })
    .then(resp2 => {
        /// final list USE THIS !!!!!
        return resp2
    });

console.log('123')

// console.log('############',reminderObject)

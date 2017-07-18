const express = require('express');
const mongoose = require('mongoose');
const dbconfig = require('./config/database');
/// added by dom///
const {Reminder} = require('./models/reminder')
const _ = require('underscore')
// console.log(Reminder)
///

const app = express();
const { rtm, web } = require('./services/slackrtm');
const routes = require('./routes/routes');


const nlp = require('./services/nlp');
//handle all the routes
app.use('/', routes);


mongoose.connect(dbconfig.url);


/// added by dom //
function findReminder(){
    Reminder.find().exec((err,reminders) => {
        let remindTodayArray = [];
        let remindTomorrowArray = [];
        const today = new Date()
        reminders.forEach( (task) => {
            // console.log('task date', task.date)
            const taskDate = task.date
            if(taskDate.getYear() === today.getYear() && taskDate.getMonth() === today.getMonth()){
                if(task.date.getDay() === today.getDay() + 1){
                    task.remind2 = true;
                    remindTomorrowArray.push(task)
                }
                else if(task.date.getDay() === today.getDay() ){
                    task.remind = true;
                    task.remind2 = false;
                    remindTodayArray.push(task)
                }else{
                    task.remind = false;
                    task.remind2 = false;
                }
            }
        })
        if(err){
            console.log('error', err)
        }
        const returnObj = {today: remindTodayArray, tomorrow: remindTomorrowArray}
        return returnObj
    })
}
///
console.log('abc', findReminder())


// const auth = require('./services/authentication');
//auth.userRegistered('ANDREH').then(console.log).catch(console.log);
// auth.checkUser('ANDREH1').then(resp => console.log(resp)).catch(err => console.log('ERROR: ', err));
// auth.userAuthenticated('ANDREH1').then(resp => console.log(resp));

//start the server
app.listen(3000, function() {
    console.log('Server Listening on port 3000');
})
//rtm.start();`

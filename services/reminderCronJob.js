const Reminder = require('../models/reminder');
// const mongoURL = require('../config/database')

// console.log('reminder', Reminder)
function findReminder(){
    Reminder.find((reminders) => {
        console.log(reminders)
        let responseArray = [];
        const today = new Date()
        console.log('abc')
        reminders.forEach( (task) => {
            console.log('task date', task.date)
            const taskDate = task.date
            if(taskDate.getYear() === today.getYear() && taskDate.getMonth() === today.getMonth()){
                if(task.date.getDay() === today.getDay() + 1){
                    task.remind2 = true;
                }
                else if(task.date.getDay() === today.getDay() ){
                    task.remind = true;
                    task.remind2 = false;
                }else{
                    task.remind = false;
                    task.remind2 = false;
                }
            }
        } )
        return reminders
    })
}
// console.log(x)

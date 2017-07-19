const mongoose = require('mongoose');
const User = require('./user')
const Schema = mongoose.Schema

const reminderSchema = new Schema({
  subject: String,
  date: Date,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'  //CHECK THAT THIS IS RIGHT
  }
});

module.exports = mongoose.model('Reminder', reminderSchema);

///Amanda needs to user this to make new reminders
// const newReminder = new Reminder ({
//     subject: "eat me",
//     date: new Date(),
//     user_id: "596e83742e70284cc0ff8b2f"
// })
// newReminder.save((err) => {
//     if(err){console.log(err)}
// })
const mongoose = require('mongoose');
const User = require('./user')
const Schema = mongoose.Schema


const reminderSchema = new Schema({
  subject: String,
  date: Date,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'  //CHECK THAT THIS IS RIGHT
  }
});

module.exports = mongoose.model('Reminder', reminderSchema)

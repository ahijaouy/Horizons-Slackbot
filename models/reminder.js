const mongoose = require('mongoose');
const User = require('./user')

const reminderSchema = new mongoose.Schema({
  subject: String,
  date: Date,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'  //CHECK THAT THIS IS RIGHT
  }
});

module.exports = mongoose.model('Reminder', reminderSchema)

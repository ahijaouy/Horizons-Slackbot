const mongoose = require('mongoose');
const Schema = mongoose.Schema


const reminderSchema = new Schema({
  subject: String,
  date: Date,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'  //CHECK THAT THIS IS RIGHT
  }
});

const Reminder = mongoose.model('Reminder', reminderSchema)

module.exports = {
    Reminder: Reminder
}

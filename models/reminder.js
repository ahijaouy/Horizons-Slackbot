const mongoose = require('mongoose');

const reminderSchema = mongoose.Schema({
  subject: String,
  date: Date,
  user_id: {
    type: Schema.Types.ObjectId, 
    ref: 'User'  //CHECK THAT THIS IS RIGHT
  }
});

export default mongoose.model('Reminder', reminderSchema);
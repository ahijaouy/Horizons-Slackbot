const mongoose = require('mongoose');

const pendingSchema = new mongoose.Schema({
  action: String,     // reminder.add OR meeting.add
  subject: String,  
  date: Date,         // for meeting, this is the start time with both Date and Time included
  slackUser: String,
  attendees: Array,   // only for meeting
  duration: Number    // optional for meeting
});

module.exports = mongoose.model('Pending', pendingSchema);
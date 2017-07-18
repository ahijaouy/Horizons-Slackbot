// var google = require('googleapis');
// var calendar = google.calendar('v3');
// var OAuth2 = google.auth.OAuth2;
// var oauth2Client = new OAuth2();
const auth = require('./authentication');

function createReminder(day, subject) {

}

function createMeeting(people, date, time, subject)



var event = {
  'summary': 'Tutoring',
  'description': 'Tutor Me Now',
  'anyoneCanAddSelf': true,
  'visibility': 'public',
  'hangoutLink': 'https://hangouts.google.com/hangouts/_/ylkydvhwyre7bghuoi5xkvj7fye',
  'start': {
    'dateTime': time
  },
  'end': {
    'dateTime': time2
  },
  'attendees': [
    {'email': 'hijaouyaaaa@gmail.com'}
  ],
  'reminders': {
    'useDefault': true
  }
};


calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    
    callback(err, event.hangoutLink)
    //console.log(event.hangoutLink);
  });


module.exports = {

}
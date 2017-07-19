// Local Import
const auth = require('./authentication');

/************************* Exported Methods *************************/

// calendar.createReminder(slackId, date, subject)
//  - Param: slackId -> String
//           date    -> Date
//           subject -> String
//  - Description: Adds a Reminder event to the Google Calendars
//    for the user specified by the slackId for the date
//    specified with the subject specified
function createReminder(slackId, date, subject) {
  auth.getGoogleCalendar(slackId)
    .then(calendar => {
      console.log("andre's bp 1");
      calendar.events.insert({
        calendarId: 'primary',
        resource: generateReminder(date, subject)
      })
      console.log("andre's bp 1");      
    })
    .catch(err => console.log('ERROR: ', err));
}

// calendar.createMeeting(slackId, start, end, subject, attendees)
//  - Param: slackId   -> String
//           start     -> Date
//           end       -> Date
//           subject   -> String
//           attendees -> Date
//  - Description: Adds a Meeting event to the Google Calendars
//    for the user aspecified by the slackId and the attendees specified
//    for the start and end dates (with times) specified 
//    and with the subject specified
function createMeeting(slackId, start, end, subject, attendees) {
  auth.getGoogleCalendar(slackId)
    .then(calendar => {
      console.log("andre's bp 3");      
      calendar.events.insert({
        calendarId: 'primary',
        resource: generateMeeting(start, end, subject, attendees)
      })
      console.log("andre's bp 4");      
    })
    .catch(err => console.log('ERROR: ', err));
}

/************************* Local Methods *************************/

// Local Helper Function
// Generates a meeting event object
function generateReminder(date, subject) {
  return {
    'summary': subject,
    'start': {
      'date': date.toISOString().substring(0,10)
    },
    'end': {
      'date': date.toISOString().substring(0,10)
    }
  };
}

// Local Function
// Generates a meeting event object
function generateMeeting(start, end, subject, attendees) {
  return {
    'summary': subject,
    'start': {
      'dateTime': start.toISOString()
    },
    'end': {
      'dateTime': end.toISOString()
    },'attendees': attendees.map(email => ({'email': email}))
  };
}


module.exports = {
  createReminder,
  createMeeting
}
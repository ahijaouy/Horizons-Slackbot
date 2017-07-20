// Local Import
const auth = require('./authentication');


/************************* Exported Methods *************************/

function checkFreeBusy(slackId, email, start, end) {
  //Check Params for Errors
  if ((start instanceof Date) !== true) {
    throw new Error(`Expected param start to be a Date object. Instead it was type ${typeof start}`);
  }
  if ((end instanceof Date) !== true) {
    throw new Error(`Expected param end to be a Date object. Instead it was type ${typeof end}`);
  }
  if (typeof slackId !== 'string') {
    throw new Error(`Expected param slackId to be a string. Instead it was type ${typeof slackId}`);
  }
  if (typeof email !== 'string') {
    throw new Error(`Expected param email to be a string. Instead it was type ${typeof email}`);
  }

  return new Promise((resolve, reject) => {
    auth.getGoogleCalendar(slackId)
    .then(calendar => {
      calendar.freebusy.query({
        resource: {
          timeMin: start,
          timeMax: end,
          items: [{
            id: email
          }]
        }
      }, (err, resp) => {
        if (err) reject(err);
        const busy = resp.calendars[email].busy
        resolve({slackId, email, busy});
      } )
    }).catch(reject);
  });

}

// calendar.craeteReminder(slackId, date, subject)
//  - Param: slackId -> String
//           date    -> Date
//           subject -> String
//  - Description: Adds a Reminder event to the Google Calendars
//    for the user specified by the slackId for the date
//    specified with the subject specified
function createReminder(slackId, date, subject) {
  //Check Params for Errors
  if ((date instanceof Date) !== true) {
    throw new Error(`Expected param date to be a Date object. Instead it was type ${typeof date}`);
  }
  if (typeof slackId  !== 'string') {
    throw new Error(`Expected param slackId to be a string. Instead it was type ${typeof slackId}`);
  }
  if (typeof subject  !== 'string') {
    throw new Error(`Expected param subject to be a string. Instead it was type ${typeof subject}`);
  }

  return new Promise((resolve, reject) => {
    auth.getGoogleCalendar(slackId)
    .then(calendar => {
      calendar.events.insert({
        calendarId: 'primary',
        resource: generateReminder(date, subject)
      }, (err, resp) => {
        if (err) reject(err);
        resolve(resp);
      })
    }).catch(reject);
  })
}

// calendar.createMeeting(slackId, start, end, subject, attendees)
//  - Param: slackId   -> String
//           start     -> Date
//           end       -> Date
//           subject   -> String
//           attendees -> Array of Emails
//  - Description: Adds a Meeting event to the Google Calendars
//    for the user aspecified by the slackId and the attendees specified
//    for the start and end dates (with times) specified
//    and with the subject specified
function createMeeting(slackId, start, end, subject, attendees) {
  //Check Params for Errors
  if ((start instanceof Date) !== true) {
    throw new Error(`Expected param start to be a Date object. Instead it was type ${typeof start}`);
  }
  if ((end instanceof Date) !== true) {
    throw new Error(`Expected param end to be a Date object. Instead it was type ${typeof end}`);
  }
  if (typeof slackId !== 'string') {
    throw new Error(`Expected param slackId to be a string. Instead it was type ${typeof slackId}`);
  }
  if (typeof subject !== 'string') {
    throw new Error(`Expected param subject to be a string. Instead it was type ${typeof subject}`);
  }
  if ((attendees instanceof Array) !== true) {
    throw new Error(`Expected param attendees to be a Array object. Instead it was type ${typeof attendees}`);
  }

  return new Promise((response, reject) => {
    auth.getGoogleCalendar(slackId)
    .then(calendar => {
      calendar.events.insert({
        calendarId: 'primary',
        resource: generateMeeting(start, end, subject, attendees)
      }, function(err, resp) {
        if (err) reject(err);
        resolve(resp);
      })
    })
    .catch(reject);
  });
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
  createMeeting,
  checkFreeBusy
}

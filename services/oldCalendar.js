var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2();

//Amanda's Spam Account Credentials
const amandaCredentials = {
  refresh: "1/j5rlJrFAJ9i3LPaWsD6yOs-FEB0z05U4wInJJcOBBIgUeZRDOGb9ah08T9d1aWHd",
  token: "ya29.GluIBDUeu_iaT7HIlX5QAS0_3eDdOdoFUCCFddUX38ycgJ61LIunOJ9s5DSVPcqm95CPoKyGkIq77r5t4c4YZ8bNJdNYbrx63mJCj-U8bW9MIGY59iUn_VKGSjit"
}


//Callback will take err as first parameter and hangouts link as second.
module.exports = function(callback){
 // Set the authentication for a user
  oauth2Client.setCredentials({
    access_token: amandaCredentials.token,
    refresh_token: amandaCredentials.refresh
  });
  
  


  var time = new Date();
  
  
  var time2 = new Date();

  time2.setDate(time.getDate() + 1);
  time =time.toISOString();
  time2 = time2.toISOString();

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

  // Make an authorized request to create new calendar event.
  calendar.events.insert({
    auth: oauth2Client,
    calendarId: 'primary',
    resource: event,
  }, function(err, event) {
    
    callback(err, event.hangoutLink)
    //console.log(event.hangoutLink);
  });
  
//});

///END of test





}
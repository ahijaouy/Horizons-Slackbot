/* This file contains two functions that help process slack messages
by taking the input of message and event parameters and outputting
a slack friendly message with formatted dates */

/************************** EXPORTED FUNCTIONS **************************/

// method that receives an actions' parameters, may or may not include duration
// returns the number of minutes for this duration
getDuration = (parameters) => {
  if (! parameters.duration) {
    return 30;
  } else if (parameters.duration.unit === 'min') {
    return parameters.duration.amount;
  } else if (parameters.duration.unit === 'h') {
    return 60 * parameters.duration.amount;
  } else {
    return parameters.duration.amount; // should not reach here, but want to return amt if unknown unit
  }
}

// method that receives an action and its parameters
// returns the return message to show in slack message about confirming reminder or meeting
getResponseMessage = (action, parameters) => {
    let returnMsg;
    if (action === 'reminder.add') {
        returnMsg = 'Creating reminder to '+parameters.subject;
    } else {
        let people = parameters['given-name'][0];
        parameters['given-name'].forEach((person, index) => {
            if (index === parameters['given-name'].length-1 && parameters['given-name'].length > 1) {
                people += ' and '+person;
            } else if (index !== 0) {
                people += ', '+person;
            }
        })
        returnMsg = 'Scheduling a meeting with '+people+' about '+parameters.subject;
    }
    returnMsg += getSlackEditableDate(parameters.date, parameters.time);
    return returnMsg
}


/************************** LOCAL FUNCTIONS **************************/

// method that takes a date from AI api and converts it to a Slack formatted date (and time)
getSlackEditableDate = (messageDate, messageTime) => {
    console.log('received date: ', messageDate);
    let date;

    // hard code date fallback
    if (typeof messageDate !== 'number' && typeof messageDate !== 'string') {
      messageDate = '2000-01-01';
    }

    if (messageTime) {
        date = new Date(messageDate+' '+messageTime) / 1000;
        console.log('received time: ',messageTime);
        console.log("AMANDA'S TIME:", date);

        return "<!date^"+date+"^ on {date_short} at {time}|Default date: 2000-01-01 1:11:11 AM>";
    } else {
        date = new Date(messageDate) / 1000 + 86400;
        return "<!date^"+date+"^ on {date}|Default date: 2000-01-01 1:11:11 AM>";
    }
}

module.exports = { getResponseMessage, getDuration };
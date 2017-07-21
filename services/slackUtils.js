/* This file contains two functions that help process slack messages
by taking the input of message and event parameters and outputting
a slack friendly message with formatted dates */

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

module.exports = { getResponseMessage };


//NOTES:
/* //Process if input is Slack user id

if (message.text.indexOf('<@') >= 0) {
    console.log('recognizing user id input');
    axios.get('https://slack.com/api/users.list?token=xoxp-214075203605-214001278996-215348011622-6220a67bf54d0165d770c06e356c255a&pretty=1')
    .then((response) =>{
        console.log('*****************************************');
        console.log('axios response', response.data);

        // GET USERNAME FROM ID
        return message.text;
    })
    .then((resp) => {
        getApiResponse(message);
    });
} else { */

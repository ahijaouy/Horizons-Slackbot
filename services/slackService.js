const { sendQuery } = require('./nlp');

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
    
getSlackEditableDate = (messageDate, messageTime) => {
    console.log('received date: ', messageDate);
    let date;
    // if (! parseInt(date) ) {
    //     date = new Date('2000-01-01 1:11:11 AM') / 1000;
    // }
    if (messageTime) {
        date = new Date(messageDate+' '+messageTime) / 1000;
        console.log('received time: ',messageTime);
        return "<!date^"+date+"^ on {date_short} at {time}|Default date: 2000-01-01 1:11:11 AM>";
    } else {
        date = new Date(messageDate) / 1000 + 86400; 
        return "<!date^"+date+"^ on {date}|Default date: 2000-01-01 1:11:11 AM>";
    }
}

getApiResponse = (message, rtm, web) => {
    const responseJSON = {
        // "text": "*optional add text here*",
        "attachments": [
            {
                "text": "Click the button!",
                "fallback": "Supposed to show the button",
                "callback_id": "something",
                "color": "#3AA3E3",
                "attachment_type": "default",
                "actions": [
                    {
                        "name": "confirm",
                        "text": "Confirm",
                        "type": "button",
                        "value": "true"
                    },
                    {
                        "name": "confirm",
                        "text": "Cancel",
                        "type": "button",
                        "value": "false"
                    }
                ]
            }
        ]
    };

    return sendQuery(message.text, message.user)
        .then((response) => {
            let data = response.data;

            // console.log('DATA RESPONSE:', data.result);

            if (data.result.action.startsWith('smalltalk')) {
                console.log('responding to SMALL TALK');
                const msg = response.data.result.fulfillment.speech;

                return { send: msg };

                // rtm.sendMessage(response.data.result.fulfillment.speech, message.channel);
            } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
                // unspecified intents
                console.log('UNSPECIFIED');

                return {} ;

                // return;
            } else if (data.result.actionIncomplete) {
                console.log('action INCOMPLETE');
                const msg =  response.data.result.fulfillment.speech;
                return { send: msg };

                // rtm.sendMessage(response.data.result.fulfillment.speech, message.channel);
            } else {
                console.log('ACTION IS COMPLETE', data.result.parameters);

                const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
                return { post: { msg: responseMsg, json: responseJSON } };

                // // const {channel, msg, json} = slackService.getApiResponse(/*Params*/);
                // web.chat.postMessage(message.channel, responseMsg, responseJSON, function(err, res) {
                //     if (err) {
                //         console.log('Error:', err);
                //     } else {
                //         console.log('Message sent: ', res);
                //         needToRespond = false;
                //     }
                // });
            }
        })
}

module.exports = { getApiResponse };
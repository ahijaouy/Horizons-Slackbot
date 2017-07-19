const { sendQuery } = require('./nlp');
const auth = require('./authentication');
const AUTH_PREFIX = 'http://localhost:3000/';

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

    console.log('get api response');

    return sendQuery(message.text, message.user)
        .then((response) => {
            let data = response.data;

            // console.log('DATA RESPONSE:', data.result);

            if (data.result.action.startsWith('smalltalk')) {
                console.log('responding to SMALL TALK');

                const msg = response.data.result.fulfillment.speech;
                return { send: msg };

            } else if (data.result.action !== 'reminder.add' && data.result.action !== 'meeting.add') {
                console.log('UNSPECIFIED intents');

                return {} ;

            } else if (data.result.actionIncomplete) {
                console.log('action INCOMPLETE');
                const msg =  response.data.result.fulfillment.speech;
                return { send: msg };

            } else {
                console.log('ACTION IS COMPLETE', data.result.parameters);

                const responseMsg = getResponseMessage(data.result.action, data.result.parameters);
                return { post: { msg: responseMsg, json: responseJSON } };
            }
        })
}

processMessage = (message) => {
    return new Promise((resolve, reject) => {
        console.log('bp 1: ', message.user);
        auth.checkUser(message.user)
        .then((isAuthUser) => {            
            console.log('bp 2');
            if (isAuthUser) {
                console.log('authenticated route');
                resolve(getApiResponse(message));
            } else {
                console.log('unauthenticated route');
                const msg = AUTH_PREFIX+'connect?auth_id='+message.user;
                resolve({ send: msg });
            }
        });
        
    });
} 

module.exports = { getApiResponse, processMessage };

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
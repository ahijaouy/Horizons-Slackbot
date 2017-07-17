const slackConfig = require('../config/slack');

module.exports = function() {

    const RtmClient = require('@slack/client').RtmClient;
    const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
    const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

    const bot_token = slackConfig.SLACK_BOT_TOKEN || '';

    const rtm = new RtmClient(bot_token);

    let channel;

    const GENERAL_CHANNEL = "C6AQK2B1U";

    // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
        console.log('start data: ', rtmStartData.channels);
        for (const c of rtmStartData.channels) {
            if (c.is_member && c.name ==='general') {
                channel = c.id; }
        }
        console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
    });

    rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
        // if (!channel || !channel.id) {
        //     throw new Error('no channel id!');
        // }
        console.log('JARVIS started!');
        // rtm.sendMessage("Hello! Convo has started!", channel);
    });

    rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
     if (message.text && message.user !== "jarvis2" /*&& message.channel !== GENERAL_CHANNEL */) {
        console.log('message: ',message);
        // const channel = "#general"; //could also be a channel, group, DM, or user ID (C1234), or a username (@don)
        
        if (parseInt(new Date(message.text))) {
            const date = Math.round(new Date(message.text) / 1000);
            const formatted_date = "<!date^"+date+"^Date is:  {date_short} at {time}|Posted 2000-01-01 1:11:11 AM>";
            rtm.sendMessage("<@" + message.user + "> you sent a message with this date! \n "+formatted_date, message.channel); 
            // rtm.sendMessage(formatted_date, message.channel);   
        } else if (message.text = "button") {
            // const responseJSON = {
            //     "text": "Would you like to play a game?",
            //     "attachments": [
            //         {
            //             "text": "Click the button!",
            //             "fallback": "You are show the button",
            //             "callback_id": "wopr_game",
            //             "color": "#3AA3E3",
            //             "attachment_type": "default",
            //             "actions": [
            //                 {
            //                     "name": "test_button",
            //                     "text": "Select",
            //                     "type": "button",
            //                     "value": "this is the value of the button"
            //                 },
            //             ]
            //         }
            //     ]
            // };
            rtm.sendMessage("responding with button: ", message.channel);
            // rtm.sendMessage(responseJSON, message.channel);            

        } else {
            rtm.sendMessage("<@" + message.user + "> you sent this message: *"+message.text+"*", message.channel);

        }        

     }
    });

    rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
        if (message.user === 'U69S5RTGT') {

            var channel = "#general"; //could also be a channel, group, DM, or user ID (C1234), or a username (@don)
            rtm.sendMessage("Shut the fuck up <@" + message.user + ">!", message.channel);
        }
    });
    rtm.start();
}


//NOTES: 

/* format of message response from slack: 

message:  { type: 'message',
  channel: 'D6A07ERGU',
  user: 'U6A0186VA',
  text: 'hiiiii',
  ts: '1500326827.965038',
  source_team: 'T6A275ZHT',
  team: 'T6A275ZHT' }

*/

/* slack text formatting:

bold:  asterisks  (surround)
code: three ticks  (surround)
strikethrough: tildes  (surround)
block quote 1p: left carrot  (on left)
block quote 2+p: 3 left carrots  (on left)

list: new line per item, and a number or bullet before each item  (on left)
*/


/* date formatting 
    
const date = Math.round(new Date('2017-07-21 20:00:00') / 1000);
^^date that slack can comprehend

*/

/* slack attachment eg:  (with button w/i aciton)

"attachments": [
        {
            "fallback": "Required plain-text summary of the attachment.",
            "color": "#36a64f",
            "pretext": "Optional text that appears above the attachment block",
            "author_name": "Bobby Tables",
            "author_link": "http://flickr.com/bobby/",
            "author_icon": "http://flickr.com/icons/bobby.jpg",
            "title": "Slack API Documentation",
            "title_link": "https://api.slack.com/",
            "text": "Optional text that appears within the attachment",
            "fields": [
                {
                    "title": "Priority",
                    "value": "High",
                    "short": false
                }
            ],
            "actions": [
                {
                    "name": "game",
                    "text": "Chess",
                    "type": "button",
                    "value": "chess"
                },
            "image_url": "http://my-website.com/path/to/image.jpg",
            "thumb_url": "http://example.com/path/to/thumb.png",
            "footer": "Slack API",
            "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
            "ts": 123456789
        }
    ]
*/
const { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
const slackConfig = require('../config/slack');
const bot_token = slackConfig.SLACK_BOT_TOKEN || '';
const slack_verification = slackConfig.AMANDA_BOT_TOKEN || '';
const axios = require('axios');
const slackService = require('./slackService');

const rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);


let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    for (const c of rtmStartData.channels) {
        if (c.is_member && c.name ==='general') {
            channel = c.id; }
    }
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// When bot loads and opens connection to channel(s), send message to general that bot has started 
rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    rtm.sendMessage("Hello Mr. Stark. I'm ready for you ;)", channel);
    console.log('JARVIS started!');
});

// When bot receives a message:  filter to only receive DMs, filter to replace slack ids in code, 
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {

    const dm = rtm.dataStore.getDMByUserId(message.user);
    if (!dm || dm.id !== message.channel || message.type !== 'message') {
        // do nothing if message is not DM
        return;

    } else if (message.text) {
        let slackIds = [];  // array with all slack user ids in message

        // process message has slack user ids: save to array, and replae with real names in text
        if (message.text.indexOf('<@') >= 0) {
            message.text = message.text.replace(/<@(\w+)>/g, function(match, userId) { 
                console.log('MATCH:', match, userId);
                slackIds.push(userId);
                return  rtm.dataStore.getUserById(userId).profile.real_name+', ';
            });
        }
        console.log('message: ',message);

        // process message with slackService message 
        // either chat.postMessage with confirmation/cancel interactive messages 
        // or rtm.sendMessage with static message
        // or do nothing 
        slackService.processMessage(message, slackIds)
        .then((logic) => {
            console.log("logic", logic)
            if (logic.post) { 
                web.chat.postMessage(message.channel, logic.post.msg, logic.post.json, function(err, res) {
                    if (err) {
                        console.log('Error:', err);
                    } else {
                        console.log('Message sent: ', res);
                        
                    }
                });
            } else if (logic.send) {
                console.log('check me', logic.send)
                rtm.sendMessage(logic.send, message.channel);
            } else if (logic.pending) {
                rtm.sendMessage('You are in a pending state! Confirm or cancel above event to continue.', message.channel);
            } else {
                console.log('reached unspecified');
            }
        })
        .catch((err) => {
            console.log('error: ', err);
        });
    }
});

module.exports = { web, rtm };


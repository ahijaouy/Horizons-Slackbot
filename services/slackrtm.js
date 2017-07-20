const { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
const bot_token = require('../config/slack').SLACK_BOT_TOKEN || '';
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
    const feelings = ['horny ;)', 'ready for you ;)', 'slack', 'ready to fight Amanda', 'ready to eat a watermelon']
    const item = feelings[Math.floor(Math.random()*feelings.length)];
    rtm.sendMessage('Hello Mr Stark, I am ' + item, channel);
    console.log('JARVIS started!');
});

// When bot receives a message:  filter to only receive DMs, filter to replace slack ids in code,
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {

    const dm = rtm.dataStore.getDMByUserId(message.user);
    if (!dm || dm.id !== message.channel || message.type !== 'message') {
        // do nothing if message is not DM
        rtm.sendMessage("Hi. You're a dummy. Talk to me in DM.")
        return;

    } 

    // process message with slackService.processMessage which returns a logic object
    // either chat.postMessage with confirmation/cancel interactive messages 
    // or rtm.sendMessage with static message
    // or do nothing 
    slackService.processMessage(message, slackIds)
    .then((logic) => {
        if (logic.post) { 
            web.chat.postMessage(message.channel, logic.post.msg, logic.post.json, function(err, res) {
                if (err) {
                    console.log('Error:', err);
                } else {
                    console.log('Message sent: ', res);
                    
                }
            });

        } else if (logic.send) {
            rtm.sendMessage(logic.send, message.channel);

        } else if (logic.pending) {
            rtm.sendMessage('You are in a pending state! Confirm or cancel above event to continue.', message.channel);
        
        } else {
            console.log('reached unspecified');
        }
    })
    .catch((err) => {
        console.log('Error: ', err);
    });
});

module.exports = { web, rtm };

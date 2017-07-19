const { RtmClient, WebClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
const { sendQuery } = require('./nlp');
const slackConfig = require('../config/slack');

const bot_token = slackConfig.SLACK_BOT_TOKEN || '';

const rtm = new RtmClient(bot_token);
const web = new WebClient(bot_token);

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
    if (message.user === 'U69S5RTGT') {

        var channel = "#general"; //could also be a channel, group, DM, or user ID (C1234), or a username (@don)
        rtm.sendMessage("Shut the fuck up <@" + message.user + ">!", message.channel);
    }
});

module.exports = { rtm, web };

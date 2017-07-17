const slackConfig = require('../config/slack');

module.exports = function() {

    var RtmClient = require('@slack/client').RtmClient;
    var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

    var bot_token = slackConfig.SLACK_BOT_TOKEN || '';

    var rtm = new RtmClient(bot_token);

    // The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
    });

    rtm.start(); 
    console.log('testing pt2');
}



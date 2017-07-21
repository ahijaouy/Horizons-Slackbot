const { fourHourCheck } = require('./utils');
const { unauthJSON } = require('./slackInteractiveMessages');

function slackUnauth(start, slackIds, user) {
  return new Promise(function(resolve, reject) {
    const isWithinFour = fourHourCheck(start);

    if (isWithinFour) {
      const returnMsg = 'Cannot schedule! Event too soon!';
      resolve({ send: returnMsg });

    } else {
      // INTERACTIVE MESSAGE tell user that bot does not have access and will need to send request to invitees
      // prompt for confirmation and ask requester what to do if bot could not obtain google cal access for ALL invitees within 2 hours
      
      //return { post: { msg: responseMsg, json: getDropdownJson(freeTimes), data: data.result, slackIds: SLACK_IDS } };

      let returnMsg = 'Not all invitees have authorized access Google Calendar. '
      returnMsg += 'What would you like to do in two hours if not all invitees authorize access?'

      const dataToSend = { start, user };

      resolve({ post: { msg: returnMsg, json: unauthJSON, data: dataToSend, slackIds }})      
    }
  });
}
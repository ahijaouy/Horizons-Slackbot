/* File that contains the logic and processing of a message that has
attendees who have not authorize Google */

const { fourHourCheck } = require('./utils');
const { unauthJSON } = require('./slackInteractiveMessages');

function slackUnauth(start, slackIds, user, attendees, data) {
  return new Promise(function(resolve, reject) {
    const isWithinFour = fourHourCheck(start);

    if (isWithinFour) {
      const returnMsg = 'Cannot schedule! Event too soon!';
      resolve({ send: returnMsg });

    } else {
      let returnMsg = 'Not all invitees have authorized access Google Calendar. '
      returnMsg += 'What would you like to do in two hours if not all invitees authorize access?'

      console.log('data.result: ', data.result);

      const dataToSend = Object.assign({}, { unauth: { start, attendees } }, data.result.action, data.result.parameters );

      console.log("this is what i'm sending into data for message processing: ", dataToSend);      

      // resolve sends back to slackService to save start time, user, attendees, and INSERT MORE to user.pending
      resolve({ post: { msg: returnMsg, json: unauthJSON, data: dataToSend, slackIds }}); 
    }
  });
}

module.exports = { slackUnauth };
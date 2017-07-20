const utils = require('./utils');

function slackUnauth(start, slackIds, user) {
  return new Promise(function(resolve, reject) {
    const isWithinFour = utils.fourHourCheck(start);

    if (isWithinFour) {
      const returnMsg = 'Cannot schedule! Event too soon!';
      resolve({ send: returnMsg });

    } else {
      // tell user that bot does not have access and will need to send request to invitees
      
      // prompt for confirmation and ask requester what to do if bot could not obtain google cal access for ALL invitees within 2 hours
      const returnMsg = 'here is where events 4+ hours later from now will be handled';
      resolve({ send: returnMsg });
    }
  });
}
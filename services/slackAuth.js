/* This file contains a function that handles the processing of a Meeting event
   in which all invitees have authorized calendar access
*/

const { findFreeTimes, checkForConflicts } = require('./conflicts');
const { responseJSON, getDropdownJson } = require('./slackInteractiveMessages');
const { getResponseMessage } = require('./slackUtils');

const slackAuth = (attendeesObj, SLACK_IDS, times, data) => {
  const emails = attendeesObj.found;
  const responseMsg = getResponseMessage(data.result.action, data.result.parameters);

  return new Promise(function(resolve, reject) {

    const conflict = checkForConflicts(SLACK_IDS, emails, times.start, times.end);  
    return conflict.then((x) => {
      console.log('YO THIS IS X', x);

      if(!x.conflicts){
        resolve({ post: { msg: responseMsg, json: responseJSON, data: data.result} });
        
      } else {  
        return findFreeTimes(SLACK_IDS, times.start, times.end, times.duration)
        .then(freeTimes => {
          const timesArray = {read:[], not:[]};
          while (timesArray.read.length < 4){
              freeTimes.forEach((sections) => {
                  timesArray.read.push('start: ' + (sections.start.getMonth() + 1)
                  + '/' + sections.start.getDate()
                  + '/' + sections.start.getFullYear()
                  + ' at ' + (sections.start.getHours() !== 0 ? sections.start.getHours() : '12')
                  + ':' +
                  (sections.start.getMinutes() !== 0 ? sections.start.getMinutes() : '00')
              )
              timesArray.not.push(sections.start)
            });
          }
          console.log('******', timesArray)
          resolve({ post: { msg: responseMsg, json: getDropdownJson(timesArray), data: data.result } });
        })
      };
    });
  });
}

module.exports = { slackAuth };
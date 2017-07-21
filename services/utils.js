// Local Import
const User = require('../models/user.js');
const _ = require('underscore');

// utils.linkEmails(idArray)
//  - Param: idArray -> Array of SlackIds
//  - Description: Generates an object with two
//    keys (found & notFound). Found key contains
//    an array of emails that were matched.
//    notFound contains the Ids for which no match was found.
//  - Returns: {found: [], notFound: []}
function linkEmails(idArray){
  return new Promise((resolve, reject) => {
    Promise.all(idArray.map(slackId => userExists(slackId)))
      .then(users => {
        let found = [];
        let notFound = [];
        users.forEach((user) => {
          if (user.exists) {
            found.push(user.email);
          } else {
            notFound.push(user.slackId);
          }
        });
        resolve( {found, notFound});
      })
      .catch(reject);
  });
}

// Local Helper function that checks if a given slackId
// exists in the Database
function userExists(slackId){
  return new Promise((resolve, reject) => {
    User.findOne({slackId}, (err, user) => {
      if (err) reject(err);
      if (user && user.email) {
        resolve({
          exists: true,
          slackId: slackId,
          email: user.email
        });
      } else {
        resolve({ exists: false, slackId: slackId})
      }
    })
  })
}

// utils.getEndDate(date, duration)
//  - Param: date     -> Date
//           duration -> Number (Optional)
//  - Description: Generates a new date that is the
//    specified duration after the specified date.
//    The default duration is 30 minutes.
//  - Returns: a new Date object
function getEndDate(date, duration = 30){
  const startDate = date.getTime();
  const durationInMs = duration * 1000 *60
  return new Date(startDate+durationInMs);
}

// utils.fourHourCheck(date)
//  - Param: date     -> Date of start date
//  - Description: Generates a boolean value true if the 
//    start date is before 4 hours from now, false otherwise
//  - Returns: boolean
function fourHourCheck (date) {
  const difference = new Date(date) - new Date();
  const fourHours = 4*60*60*1000;
  if(0< difference && difference < fourHours){
    return true;
  }else{
    return false;
  }
}


module.exports = {
  linkEmails,
  getEndDate,
  fourHourCheck
}

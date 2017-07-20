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
const linkEmails = (idArray) => {
  let found = [];
  let notFound = [];
  idArray.forEach((slackId) => {
    User.findOne({slackId:slackId})
    .then( userObject => {
      if(userObject){
        found.push(userObject.email)
      } else{
        notFound.push(slackId)
      }
    })
    .catch(err => console.log('error', err))
  });
  return {found, notFound};
}

// utils.getEndDate(date, duration)
//  - Param: date     -> Date
//           duration -> Number (Optional)
//  - Description: Generates a new date that is the
//    specified duration after the specified date.
//    The default duration is 30 minutes.
//  - Returns: a new Date object
const getEndDate = (date, duration = 30) => {
  const startDate = date.getTime();
  const durationInMs = duration * 1000 *60
  return new Date(startDate+durationInMs);
}

const fourHourCheck = (date) =>{
  const difference = new Date(date) - new Date();
  if(0< difference && difference < 14400000){
    return true;
  }else{
    return false;
  }
}


module.exports = {
  linkEmails,
  getEndDate
}

const User = require('../models/user.js');

linkEmails = (idArray) => {
  let emailArray = [];
  let unfoundArray = [];
  idArray.forEach((slackId) => {
    User.findOne({slackId:slackId})
    .then((userObject)=>{
      if(userObject){
        emailArray.push(userObject.email)
      }else{
        unfoundArray.push(slackId)
      }
    })
    .catch((err) => {
      console.log('error', err)
    })
  });

  let emailObject = {found: emailArray, notFound: unfoundArray}
  return emailObject;
}

getEndDate = (date, duration = 30) => {
  let startDate = date.getTime();
  let durationInMs = duration * 1000 *60
  return new Date(startDate+durationInMs);
}

module.exports = {
  linkEmails: linkEmails,
  getEndDate: getEndDate
}

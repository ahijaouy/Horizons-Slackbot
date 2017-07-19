const User = require('../models/user.js');

let emailArray = [];
let unfoundArray = [];
function linkEmails(idArray){
  idArray.forEach((slackId) => {
    User.findOne({slackId:slackId})
    .then((userObject) => {
      if(userObject){
        emailArray.push(userObject.email)
      }else{
        unfoundArray.push(slackId)
      }
    })
    .catch((err) => {
      console.log('error', err)
    });
  });
}
let emailObject = {found: emailArray, notFound: unfoundArray}
export default emailObject;
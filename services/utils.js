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

//
// - Param: timeArray -> Array
//
// - Description: Finds and recommends event times to avoid conflict
// //
//  function findFreeTime(busyArray) {
//    let freeArray = [];
//    let busyObject =_.groupBy(busyArray,(dataString)=>{
//      console.log(new Date(dataString.start),new Date(dataString.start).getDate() )
//      return new Date(dataString.start).getDate()});
//    console.log('busyObject', busyObject)
//    for(var key in busyObject){
//      const lastItem = busyObject[key][busyObject[key].length-1]
//      if(!busyObject.hasOwnProperty(key)){
//        console.log('tried to access a random key');
//      }else{
//        busyObject[key]=busyObject[key].sort(
//          (a,b)=> {
//          a = new Date(a.start);
//          b = new Date(b.start);
//          return a>b ? -1 : a<b ? 1 : 0;
//        })
//        if(new Date(busyObject[key][0].start).getHours() > 9){
//          let end = busyObject[key][0].start;
//          let temp = new Date(busyObject[key][0].start)
//          let start = new Date(temp.setHours('9'))
//          freeArray.push({start,end})
//        }
//        for(let slot = 0; slot < busyObject[key].length - 1; slot++){
//           if((busyArray[slot+1].start-busyArray[slot].end) > 1800000){
//             freeArray.push({start:busyArray[slot].end, end:busyArray[slot+1].start})
//           }
//         }
//         if(new Date(lastItem.end).getHours() < 17){
//           let start = lastItem.end;
//           let temp = new Date(lastItem.end);
//           let end = new Date(temp.setHours('17'))
//           freeArray.push({start,end})
//         }
//      }
//    }
//   //  if(busyArray[0])
//   //
//   //  for(let slot = 0; slot < busyArray.length - 1; slot++){
//   //    if(((busyArray[slot+1].start-busyArray[slot].end) > 1800000)
//   //    &&(busyArray[slot+1].start.getDate() === busyArray[slot].end.getDate())){
//   //      freeArray.push({start:busyArray[slot].end, end:busyArray[slot+1].start})
//   //    }
//   //  }
//   return freeArray;
//  }

function findFreeTime(){
  let duration = 30;
  const durationInMs = duration * 60 * 1000;
  let freeArray = [];
  let optionArray = [];
  allFreeArray = [ { start: '2017-07-20T15:30:00', end: '2017-07-20T16:00:00' },
  { start: '2017-07-20T17:00:00', end: '2017-07-20T17:30:00' },
  { start: '2017-07-20T18:00:00', end: '2017-07-20T18:30:00' },
  { start: '2017-07-20T19:00:00', end: '2017-07-20T20:00:00' },
  { start: '2017-07-21T00:30:00', end: '2017-07-21T02:00:00' },
  { start: '2017-07-21T17:00:00', end: '2017-07-21T18:00:00' } ]
  allFreeArray.forEach((slot)=>{
    if((new Date(slot.end)- new Date(slot.start)) > durationInMs){
      freeArray.push({
        start: new Date(slot.start),
        end: getEndDate(new Date(slot.start), duration)
      })
    }
  })
  let count = 1;
  optionArray.push(freeArray[0]);
  for(var slot = 0; slot < freeArray.length; slot ++){
    let currDate = optionArray[optionArray.length-1].start.getDate();
    if(optionArray.length < 11 ){
      if(freeArray[slot].start.getDate()===currDate){
        if(count < 4){
          optionArray.push(freeArray[slot]);
          count ++;
        }else{
          continue;
        }
      }else{
        currDate = freeArray[slot].start.getDate()
        count = 1
        optionArray.push(freeArray[slot])
      }
    }else{
      break;
    }
  }
  return optionArray;
}
console.log(findFreeTime())
module.exports = {
  linkEmails,
  getEndDate
}

// NPM Libraries
const _ = require('underscore');

// Local Imports
const calendar = require('./calendar');
const User = require('../models/user');
const util = require('./utils')


/************************* Exported Methods *************************/

function findFreeTimes(slackIds, start, end, duration = 30){
  return new Promise((resolve)=> {
    const durationInMs = duration * 60 * 1000;
    let freeArray = [];
    let optionArray = [];
    console.log('about to enter Andre');
    generateFreeTimes(slackIds, start,end)
    .then( allFreeArray => {
      console.log('just left andre');
      allFreeArray.forEach( slot => {
        if((new Date(slot.end)- new Date(slot.start)) > durationInMs){
          freeArray.push({
            start: new Date(slot.start),
            end: util.getEndDate(new Date(slot.start), duration)
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
      resolve(optionArray);
    })
  })
}




/************************* Local Methods *************************/

// Authentication.generateAuthUrl(slackId)
//  - Param: slackIds -> Array
//           start    -> Date
//           end      -> Date
//  - Description: Generate an array of consolidated
//    free times for all the slackIds specified.
//  - Returns: a PROMISE that will resolve to an array
//    of objects with keys 'start' & 'end' keys
//    which point to Date objects.
function generateFreeTimes(slackIds, start, end) {
  return getTimeConflicts(slackIds, start, end)
  .then(mergeTimeConflicts)
  .then(consolidateConflicts)
  .then(consolidated => getAvailabilityFromConflicts(consolidated, start, end))
  .catch(console.log)
}

// Local Helper Function
// Makes calls to Google's API to generate information on
// busy times for the users corresponding to the slackIds specified
// Returns a PROMISE that resolves to an Object with info for each user.
function getTimeConflicts(slackIds, start, end) {
  return Promise.all(slackIds.map(slackId => User.findOne({slackId})))
  .then(users => {
    return Promise.all(users.map(user => {
      return calendar.checkFreeBusy(user.slackId, user.email, start, end);
    }));
  })
  .catch(console.log);
}

// Local Helper Function
// Takes in the array of object resolved from
// conflicts.getTimeConflicts() and merges all the
// user's busy times into a single array.
// Returns a PROMISE that resolves to a list of sorted
// times during which the users specified are busy
function mergeTimeConflicts(conflicts) {
  return new Promise(function(resolve, reject) {
    const merged = [];
    conflicts.forEach( conflict => {
      conflict.busy.forEach(busy => merged.push(busy))
    })
    resolve( _.sortBy(merged,first => first.start));
  })

}

// Local Helper Function
// Consolidates busy times passed in into
// blocks where possible.
// Returns a PROMISE which resolves to the array
// of consolidated busy times.
function consolidateConflicts(conflicts) {
  return new Promise(function(resolve, reject) {
    const consolidated = [];
    let i = 0;
    while (i < conflicts.length) {
      const first = conflicts[i];
      const second = conflicts[i + 1];
      if (!second) {
        consolidated.push(first);
        i++;
      } else if(checkForOverlap(first, second)) {
        consolidated.push(mergeTwoDates(first, second));
        i += 2;
      } else {
        consolidated.push(first);
        i++;
      }
    }
    resolve(consolidated);
  })

}

// Local Helper Function
// Takes the list of consolidated busy times and generates
// all the times that are 'free' between the startAvailability
// and endAvailability parameters.
// Returns a PROMISE that resolves into an array of Free times.
function getAvailabilityFromConflicts(conflicts, startAvailability, endAvailability) {
  return new Promise(function(resolve) {
    const freeTime = [];
    if (conflicts[0].start !== startAvailability) {
      freeTime.push({start: startAvailability, end: conflicts[0].start});
    }
    for (let i = 0; i < conflicts.length; i++) {
      const first = conflicts[i];
      const second = conflicts[i + 1];
      if (!second && first.end !== endAvailability) {
        freeTime.push({ start: first.end, end: endAvailability})
      } else {
        freeTime.push({ start: first.end, end: second.start});
      }
    }
    resolve(freeTime);
  })

}

// Local Helper Function
// Merges to objects with 'start' and 'end' keys
function mergeTwoDates(first, second) {
  return {start: first.start, end: second.end}
}
// Local Helper Function
// Checks to see if the second parameter starts
// before the first parameter ends.
function checkForOverlap(first, second) {
  return second.start < first.end;
}

module.exports = {
  findFreeTimes
}

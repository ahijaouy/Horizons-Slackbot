/* File that contains the formatting of the json object that any interactive message requires */

/******************** EXPORTED FUNCTIONS & OBJECTS ********************/

/* JSON object for interactive message with Confirm and Cancel buttons */
const responseJSON = {
  // "text": "*optional add text here*",
  "as_user": true,
  "attachments": [
    {
      // "text": "Click to *Confirm* or *Cancel*!",
      "fallback": "[insert confirm and cancel buttons]",
      "callback_id": "confirm_cancel_event",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [
        {
          "name": "confirm",
          "text": "Confirm",
          "type": "button",
          "value": "true"
        },
        {
          "name": "confirm",
          "text": "Cancel",
          "type": "button",
          "value": "false"
        }
      ]
    }
  ]
};

/* JSON object for interactive message with Confirm and Cancel buttons */
const unauthJSON = {
  // "text": "*optional add text here*",
  "as_user": true,
  "attachments": [
    {
      // "text": "Click to *Confirm* or *Cancel*!",
      "fallback": "[insert unauth confirm and cancel buttons]",
      "callback_id": "unauth_route",
      "color": "#3AA3E3",
      "attachment_type": "default",
      "actions": [
        {
          "name": "waitOnAttendees",
          "text": "Schedule Anyway!",
          "type": "button",
          "value": "true"
        },
        {
          "name": "waitOnAttendees",
          "text": "Cancel Meeting",
          "type": "button",
          "value": "false"
        }
      ]
    }
  ]
};

/* function that returns JSON object for interactive message
has dropdown with dates from dates array */
function getDropdownJson(dates) {
    ///
    // const abc = ['monday', 'tuesday', 'wednesday']
    ///
    const datesArray = []
    for(var i = 2 ; i < dates.read.length ; i ++){
        const value = dates.not[i];
        const text = dates.read[i]
        datesArray.push({"text": text, "value": value})
    }

  return {
    "as_user": true,
    "attachments": [
      {
        "text": "There is a conflict with that time, please choose an alternative below",
        "fallback": "pick a date",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "callback_id": "date",
        "actions": [
          {
            "name": "conflicts",
            "text": "Pick a date...",
            "type": "select",
            "options": datesArray
          }
        ]
      }
    ]
  };
}

module.exports = {
  responseJSON,
  unauthJSON,
  getDropdownJson
};

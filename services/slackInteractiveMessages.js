/* File that contains the formatting of the json object that any interactive message requires */

/* JSON object for interactive message with Confirm and Cancel buttons */
const responseJSON = {
  // "text": "*optional add text here*",
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
  return {
    "attachments": [
      {
        "text": "Choose a date that you are free",
        "fallback": "pick a date",
        "color": "#3AA3E3",
        "attachment_type": "default",
        "callback_id": "date",
        "actions": [
          {
            "name": "date_list",
            "text": "Pick a date...",
            "type": "select",
            "options": dates.map((date) => ({"text": date, "value": date}))
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

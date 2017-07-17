/**
 * Cloud Function.
 * 
 * To Redeploy the code do the following:
 * 
 * Follow instructions 1-5 here: 
 * https://cloud.google.com/functions/docs/quickstart
 * 
 * run this command:
 *     gcloud beta functions deploy [NAME OF THING BEING EXPORTED] --stage-bucket slackbot--trigger-http
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.helloWorld = function helloWorld (event, callback) {
  console.log(`My Cloud Function: ${event.data.message}`);
  callback();
};

exports.helloHttp = function helloHttp (req, res) {
    //res.json(req);
  response = "This is a sample response from your webhook!" //Default response from the webhook to show it's working

res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
  res.send(JSON.stringify({ "speech": response, "displayText": response 
  //"speech" is the spoken version of the response, "displayText" is the visual version
  }));
};
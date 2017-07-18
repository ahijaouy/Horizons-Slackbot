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
  console.log(JSON.parse(req.body.payload));
  res.send(req);
};
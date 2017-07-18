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

exports.testBody = function testBody(req, res) {
  const payload = JSON.parse(req.body.payload);
  if (payload.actions[0].value === 'true') {
      res.send('Created reminder! :white_check_mark:');
  } else {
      res.send('Canceled! :x:');
  }
}

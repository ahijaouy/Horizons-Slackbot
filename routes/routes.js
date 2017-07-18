const express = require('express');
const router = express.Router();

//handle Slack button press: handles request of Confirm/Cancel reminder
router.post('/slack/interactive', (req, res) => {
    console.log(JSON.parse(req.body.payload));
    if (req.body.payload.actions[0].value === 'true') {
        res.send('Created reminder! :white_check_mark:');
    } else {
        res.send('Canceled! :x:');
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();

//handle Slack button press: handles request of Confirm/Cancel reminder
router.post('/slack/interactive', (req, res) => {
    console.log(JSON.parse(req.body.payload));
    const payload = JSON.parse(req.body.payload);
    if (payload.actions[0].value === 'true') {
        res.send('Event created! :white_check_mark:');
    } else {
        res.send('Canceled! :x:');
    }
});

module.exports = router;
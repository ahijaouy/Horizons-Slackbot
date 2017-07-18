const express = require('express');
const router = express.Router();
const auth = require('../services/authentication');

router.get('/connect', (req, res) => {
    res.redirect(auth.generateAuthUrl(req.query.auth_id));
});

router.get('/connect/callback', (req, res) => {
    const id = JSON.parse(decodeURIComponent(req.query.state)).auth_id;
    auth.generateAuthTokens(req.query.code, id);
    res.send('Successfully Authenticated with Google!');
});

module.exports = router;
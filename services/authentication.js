// NPM Imports
const google = require('googleapis');
const axios = require('axios');

// Local Imports
const User = require('../models/user');
const authConfig = require('../config/auth').googleAuth;


// Global Variables
const OAuth2 = google.auth.OAuth2;
const plus = google.plus('v1');
const oauth2Client = new OAuth2(authConfig.clientID,authConfig.clientSecret, authConfig.callbackURL);


/************************* Exported Methods *************************/

// Authentication.generateAuthUrl(slackId)
//  - Param: slackId -> String
//  - Description: Generate a Google Auth URL 
//    for a user given their SlackId
function generateAuthUrl(id) {
    return new Promise(function(resolve, reject) {
        User.findById(id)
            .then(user => {
                const url = oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    prompt: 'consent',
                    scope: [
                        'https://www.googleapis.com/auth/userinfo.email',
                        'https://www.googleapis.com/auth/calendar'
                    ],
                    state: encodeURIComponent(JSON.stringify({auth_id:user._id}))
                });
                resolve(url)
            });
    })
}

// Authentication.getGoogleCalendar(slackId)
//  - Param: slackId -> String
//  - Description: Generates an instance of a Google
//    Calendar API Instance authenticated for the given
//    slackId passed in.
//  - Returns: Google Calendar Object
function getGoogleCalendar(slackId) {
    return new Promise(function(resolve, reject) {
        getAuthClient(slackId)
            .then(client => resolve(google.calendar({version: 'v3',auth: client})))
            .catch(reject)
    })
}

// Authentication.checkUser(slackId)
//  - Param: slackId -> String
//  - Description: Ensures the user exists in DB and 
//    creates it if it doesn't
//  - Returns: the User Model associated with the SlackId
function checkUser(slackId) {
    return new Promise(function(resolve, reject) {
        User.findOne({slackId}, (err, user) =>{
            if (err) reject(err);
            if (!user) {
                const newUser = new User({slackId: slackId, authenticated: false});
                newUser.save().then(resolve)
            } else {
                resolve(user);
            }
        });
    });
}

// Authentication.generateAuthTokens(code, id)
//  - Param: id   -> String
//           code -> String
//  - Description: Generates Google Tokens 
//    for a user given the Google Code & SlackID.
//    Then saves tokens & email in MongoDB
function generateAuthTokens(code, id) {
    const localoAuth2Client = getoAuthClient();
    localoAuth2Client.getToken(code, function (err, tokens) {
        if (err) {
            console.log(err);
        } else {
            localoAuth2Client.setCredentials(tokens);
            //Get the user's email 
            plus.people.get({auth: localoAuth2Client, userId: 'me'}, function(err, resp) {
                const email2 = resp.emails[0].value;
                //Update the user profile with their email & google tokens
                User.findByIdAndUpdate(id, {google: tokens, authenticated: true, email: email2}, function(err, result) {
                    if (err) console.log(err);
                });
            })
        }
    });
}

/************************* Local Methods *************************/

// Local Helper Function
// Configures the 0Auth Client for an authenticated User 
// given  a SlackID. Also ensures the token is active.
function getAuthClient(slackId) {
    return User.findOne({slackId})
        .then(user => {
            const localoAuth2Client = getoAuthClient();
            localoAuth2Client.setCredentials(user.google);

            const expiryDate = new Date(user.expiry_date);
            if (expiryDate < new Date()) {
                localoAuth2Client.refreshAccessToken(function(err, tokens) {
                    localoAuth2Client.setCredentials(tokens);
                    user.google = tokens;
                    user.authenticated = true;   
                    return user.save().then(() => localoAuth2Client);    
                });
            } else {
                return localoAuth2Client;
            }
        }).catch(console.log)
}

function getoAuthClient() {
    return new OAuth2(authConfig.clientID,authConfig.clientSecret, authConfig.callbackURL);
}

module.exports = {
    generateAuthUrl,
    generateAuthTokens,
    getGoogleCalendar,
    checkUser
}
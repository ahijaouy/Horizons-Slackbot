const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const plus = google.plus('v1');
const axios = require('axios');
const User = require('../models/user');
const authConfig = require('../config/auth').googleAuth;

const oauth2Client = new OAuth2(authConfig.clientID,authConfig.clientSecret, authConfig.callbackURL);

//Ensures a user is registered
//Post-condition: The user will exist in the DB
//Returns: n/a
function userRegistered(slackId) {
    return new Promise(function(resolve, reject) {
        User.findOne({slackId}, (err, user) =>{
            if (err) reject(err);
            if (!user) {
                const newUser = new User({slackId: slackId, authenticated: false});
                newUser.save(resolve());
            } else {
                resolve();
            }
        
        });
    });
}

//Determine if the user has already been authenticated with Google
//Returns: a PROMISE that will resolve to a user's authentication status w/ google
function userAuthenticated(slackId) {
    return new Promise (function(resolve, reject) {
        User.findOne({slackId}, (err, user) => {
            if (err) reject(err);
            resolve(user.authenticated);
            
        });
    })
    
}


// Wrapper function that ensures that the user exists in DB 
// and then returns their authentication status
function checkUser(slackId) {
    return new Promise(function(resolve, reject) {
        console.log('Test:');
        userRegistered(slackId)
            .then(() => userAuthenticated(slackId))
            .then(resolve)
            .catch(reject)
    });
}


//Configures the 0Auth Client for an authenticated User given  a SlackID
//Pre Condition: User exists in DB & is Authenticated
//Post Condition: oauth2Client will have credentials set for a specific user 
//RETURNS a PROMISE that will resolve to the oauthClient;
function getAuthClient(slackId) {
    return new Promise(function(resolve, reject) {
        User.findOne({slackId}, (err, user) => {
            if (err) console.log('Error: ', err);
                axios.get('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + user.google.access_token)
                    .then(resp => {
                        oauth2Client.setCredentials(user.google);
                        if (resp.expires_in < 50) {
                            oauth2Client.refreshAccessToken(function(err, tokens) {
                                User.findByIdAndUpdate(user.id, {google: tokens, authenticated: true })
                            });
                        } 
                        resolve(oauth2Client);
                    })
                    .catch(err => {
                        if (err.response.data.error === 'invalid_token') {
                            oauth2Client.setCredentials(user.google);
                            oauth2Client.refreshAccessToken(function(err, newTokens) {
                                User.findByIdAndUpdate(user.id, { google: newTokens, authenticated: true })
                            });
                            resolve(oauth2Client);
                        } else {
                            reject(err);
                        }
            })
        });
    });
}
//Generates and Saves Google Tokens for a user given the Google Code & SlackID
//Pre Condition: User exists in DB
//Post Condition: User document in DB will contain google Tokens 
function generateAuthTokens(code, slackId) {
    oauth2Client.getToken(code, function (err, tokens) {
        if (err) console.log(err);
        console.log('TOKENS: ', tokens);
        if (!err) {
            oauth2Client.setCredentials(tokens);
            //Get the user's email 
            plus.people.get({
                    auth: oauth2Client,
                    userId: 'me'
                }, function(err, resp) {
                    const userEmail = resp.emails[0].value;
                    console.log('EMAIL: ', userEmail);
                    //Update the user profile with their email & google tokens
                    User.findOneAndUpdate({slackId}, { 
                        google: tokens, 
                        authenticated: true,
                        email: userEmail }, function(err, result) {
                            if (err) console.log(err);
                        });
                })
        }
    });
}

//Generate Google Auth URL for a user given their SlackId
//Returns: Google Auth URL --> STRING
function generateAuthUrl(slackId) {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/calendar'
        ],
        state: encodeURIComponent(JSON.stringify({auth_id:slackId}))
    });
}

function getGoogleCalendar(slackId) {
    return new Promise(function(resolve, reject) {
        getAuthClient(slackId)
            .then(client => resolve(google.calendar({version: 'v3',auth: client})))
            .catch(reject)
    })
    
}

function getEmail(slackId) {
    return new Promise(function(resolve, reject) {
        getAuthClient(slackId)
            .then(client => {
                plus.people.get({
                    auth: client,
                    userId: 'me'
                }, function(err, resp) {
                    console.log("RESP: ", resp.emails[0].value);
                })
            })

    })
    

    

    
}

module.exports = {
    generateAuthUrl,
    generateAuthTokens,
    getGoogleCalendar,
    checkUser,
}
// NPM Imports
const axios = require('axios');

// Local Imports
const aiConfig = require('../config/ai');

// Global Variables
const api_ai = axios.create({
  baseURL: aiConfig.API_URL_BASE,
  headers: {'Authorization': 'Bearer ' + aiConfig.CLIENT_ACCESS_TOKEN}
});

// Local Helper Function
// Generates the url to sent to API.AI
function generateQueryString(query, id) {
    return '/query?v=20150910&lang=en&sessionId=' + id + '&query=' + encodeURIComponent(query);
}

// nlp.sendQuery(query, slackId)
//  - Param: slackId -> String
//           query   -> String
//  - Description: Send an API call to API.AI
//    using the query string and slackId specified
function sendQuery(query, slackId) {
    return api_ai.get(generateQueryString(query, slackId))
}
    
module.exports = {
    sendQuery
}
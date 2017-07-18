const axios = require('axios');
const uuid = require('uuid/v1');
const aiConfig = require('../config/ai');
const queryVariables = '?v=20150910&lang=en'

const api_ai = axios.create({
  baseURL: aiConfig.API_URL_BASE,
  headers: {'Authorization': 'Bearer ' + aiConfig.DEV_ACCESS_TOKEN}
});

function generateQueryString(query, id) {
    return '/query?v=20150910&lang=en&sessionId=' + id + '&query=' + encodeURIComponent(query);
}
    
module.exports = {
    sendQuery : ((query, oldId) => api_ai.get(generateQueryString(query, oldId || uuid())))

}
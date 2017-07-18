const axios = require('axios');
const aiConfig = require('../config/ai');

var instance = axios.create({
  baseURL: aiConfig.API_URL_BASE,
  timeout: 1000,
  headers: {'Authorization': 'Bearer ' + aiConfig.DEV_ACCESS_TOKEN}
});

var url = aiConfig.API_URL_BASE 
    + '/query?v=20150910&query=' 
    + encodeURIComponent('Remind me to buy Dom a Coffee tomorrow');

var url2 = '/query?v=20150910&query=' 
    + encodeURIComponent('Remind me to buy Dom a Coffee ')
    + '&lang=en&name=testingME&sessionId=1234abcd';
    
module.exports = function() {
    console.log('inside');
    // axios.get(url)
    // .then(function (response) {
    //     console.log(response);
    // })
    // .catch(function (error) {
    //     console.log(error);
    // });
    instance.get(url2)
        .then(console.log)
        .catch(console.log);

}
'use strict'

const nlp = require('./nlp');  
const expect = require('chai').expect

//Authentication.js
describe('NLP module', () => {  
    
    // getGoogleTokens()
    describe('sendQuery()', () => {
        it('should export a function', () => {
            expect(nlp.sendQuery).to.be.a('function')
        })
        it('should return an object', () => {
            nlp.sendQuery("Remind me to buy a coffee tomorrow").then(resp => {
                console.log(resp);
                expect(resp.to.be.a('object'));
            });
        })
  })
  
})
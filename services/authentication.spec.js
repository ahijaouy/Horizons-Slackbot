'use strict'

const auth = require('./authentication');  
const expect = require('chai').expect

//Authentication.js
describe('Authentication module', () => {  
    
    // getGoogleTokens()
    describe('getGoogleTokens()', () => {
        it('should export a function', () => {
            expect(auth.getGoogleTokens).to.be.a('function')
        })
        it('should return an object', () => {
            expect(auth.getGoogleTokens("ANDREH"), "Did not return an object");
        })
  })
  
})
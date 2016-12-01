'use strict';

const request = require('request');
const Promise = require('bluebird');

module.exports = {
  get(year, location){
    return new Promise((resolve, reject) => {
      const options = {
        url: 'http://kayaposoft.com/enrico/json/v1.0/',
        qs: {
          action: 'getPublicHolidaysForYear',
          year: year, country: location
        },
        json: true
      };
      request.get(options, (err, httpResponse, body) => {
        if (err || httpResponse.statusCode != 200) {
          reject(err || { status: `responseCode is ${response.statusCode}` })
        } else {
          resolve(body);
        }
      });
    });
  }
};
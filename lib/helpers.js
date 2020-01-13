/**
 * Helper function for the API
 */

//  Dependencies
const crypto = require('crypto');
const config = require('./config');
// helper object
const helpers = {};

// hashing password with SHA256
helpers.hash = str => {
  if (typeof str == 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', config.hashingSecret)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// Parsing json string to object without throwing
helpers.parseJsonToObject = str => {
  try {
    const obj = JSON.parse(str);
    return obj;
  } catch (error) {
    return {};
  }
};

// creating random ID
helpers.createRandomID = strLength => {
  strLength = typeof strLength == 'number' && strLength > 0 ? strLength : false;

  if (strLength) {
    // possible character to be included
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    let str = '';
    for (let i = 1; i <= strLength; i++) {
      // get random characters from the possible character
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );

      // append it to string
      str += randomCharacter;
    }

    return str;
  } else {
    return false;
  }
};

// export helpers
module.exports = helpers;

/**
 * Unit Tests for the API
 */
//  Dependencies
const handlers = require('../lib/handlers');
const helpers = require('../lib/helpers');
const assert = require('assert');

// unit object
const unit = {};

// asserts that helper hash return a hashed string
unit['helpers.hash should return a hashed string'] = done => {
  const val = helpers.hash('123456');
  assert.equal(typeof val, 'string');
  done();
};

// export
module.exports = unit;

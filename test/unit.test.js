/**
 * Unit Tests for the API
 */
//  Dependencies
const data = require('../lib/data');
const helpers = require('../lib/helpers');
const assert = require('assert');
const util = require('util');

// unit object
const unit = {};

// helpers unit test

// asserts that helper hash return a string
unit['helpers.hash should return a string'] = done => {
  const val = helpers.hash('123456');
  assert.strictEqual(typeof val, 'string');
  done();
};

// asserts that helper hash return a hashed string
unit['helpers.hash should return a hashed string'] = done => {
  const val = helpers.hash('123456');
  assert.strictEqual(val, helpers.hash('123456'));
  done();
};

// asserts that helper hash return a string
unit['helpers.hash should not return a number'] = done => {
  const val = helpers.hash('123456');
  assert.notStrictEqual(typeof val, 'number');
  done();
};

// assert that helpers parse json object should return an object
unit['helpers.parseJsonObject should return an object'] = done => {
  const obj = {a: 'b'};

  const val = helpers.parseJsonToObject(obj.toString());
  assert.strictEqual(typeof val, 'object');
  done();
};

// assert that helpers create random ID return a string
unit['helpers.createRandomID should returns a string'] = done => {
  const val = helpers.createRandomID(20);
  assert.strictEqual(typeof val, 'string');
  done();
};

// assert that helpers create random ID return a string
unit[
  'helpers.createRandomID returns value should have length of 20'
] = done => {
  const val = helpers.createRandomID(20);
  assert.strictEqual(val.length, 20);
  done();
};

// data unit testing

// eit data
const eit = {
  firstName: 'someone',
  lastName: 'anybody',
  age: '20',
  country: 'Ghana'
};

const testUser = {
  name: 'Test User',
  email: 'testuser@gmail.com',
  password: '123456'
};

// assert data.creatEit callback false error
unit['data.createEit should callback false error'] = done => {
  data.createEit('test', eit, err => {
    assert.strictEqual(err, false);
    done();
  });
};

// assert data.readEit callback false and data
unit['data.readEit should callback false error and return data.'] = done => {
  data.readEit('test', (err, data) => {
    assert.strictEqual(err, false);
    assert.strictEqual(typeof data, 'string');
    done();
  });
};

// assert data.updateEit callback false error
unit['data.updateEit should callback false error'] = done => {
  (eit.firstName = 'Everybody'),
    data.updateEit('test', eit, err => {
      assert.strictEqual(err, false);
      done();
    });
};

// assert data.create callback 201
unit['data.create should callback 201 statusCode: created'] = done => {
  const fileName = testUser.email.split('@')[0];
  util
    .promisify(data.create)('users', fileName, testUser)
    .then()
    .catch(err => {
      assert.strictEqual(err, false);
    });
  done();
};

// assert data.read callback false and return object data
unit['data.read should callback false error and return object data'] = done => {
  util
    .promisify(data.read)('users', 'jane.doe')
    .then(data => {
      assert.strictEqual(typeof data, 'object');
    })
    .catch(err => {
      assert.strictEqual(err, false);
    });
  done();
};

// // assert data.updated callback error false
unit['data.update should callback false error'] = done => {
  testUser.name = 'some test data here';
  const fileName = testUser.email.split('@')[0];
  util
    .promisify(data.update)('users', fileName, testUser)
    .then()
    .catch(err => {
      assert.strictEqual(err, false);
    });
  done();
};

// // assert data.list callback and return array of data
unit['data.list should callback false error and array of data'] = done => {
  util
    .promisify(data.list)('users')
    .then(users => {
      assert.strictEqual(Array.isArray(users), true);
    })
    .catch(err => {
      assert.strictEqual(err, false);
    });
  done();
};

// assert data.delete callback false
unit['data.delete should callback false error'] = done => {
  const fileName = testUser.email.split('@')[0];
  util
    .promisify(data.delete)('users', fileName)
    .then()
    .catch(err => {
      assert.strictEqual(err, false);
    });
  done();
};

// export
module.exports = unit;

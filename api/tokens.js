/**
 * API Handler for Tokens
 */

//  Dependencies
const util = require('util');
const _data = require('../lib/data');
const helpers = require('../lib/helpers');

// token object
const _tokens = {};

// handle the request
_tokens.handleRequest = (data, callback) => {
  const {method} = data;
  const allowedMethods = ['post', 'get', 'put', 'delete'];
  if (allowedMethods.indexOf(method) > -1) {
    _tokens[method](data, callback);
  }
};

// Promisified data
// @TODO: Promisify all request
// token - post
// required data: email, password
_tokens.post = (data, callback) => {
  let {email, password} = data.payload;

  // check for data
  email =
    typeof email == 'string' && email.trim().length > 0 ? email.trim() : false;
  password =
    typeof password == 'string' && password.trim().length > 0
      ? password.trim()
      : false;

  if (email && password) {
    // get user file name
    const userFile = email.split('@')[0];

    // verify user
    _data.read('users', userFile, (err, user) => {
      if (!err && user) {
        // compare password with hashed password
        const passwordMatch = user.hashedPassword == helpers.hash(password);
        if (passwordMatch) {
          // generate token for user
          const token = helpers.createRandomID(20);
          // create token object
          const tokenObject = {
            token,
            email,
            expire: Date.now() + 1000 * 60 * 60
          };
          // save token
          _data.create('.tokens', token, tokenObject, err => {
            if (!err) {
              callback(201);
            } else {
              callback(500);
            }
          });
        } else {
          callback(400, {Error: 'Password is invalid'});
        }
      } else {
        callback(404, {Error: 'User does not exist'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required data'});
  }
};

// token - get
// required data: token
_tokens.get = (data, callback) => {
  let {token} = data.queryStringObject;
  // check for required data
  id =
    typeof token == 'string' && token.trim().length == 20
      ? token.trim()
      : false;

  if (token) {
    // look for user
    _data.read('.tokens', token, (err, data) => {
      if (!err && data) {
        callback(200, data);
      } else {
        callback(404, {Error: 'User not found'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required user'});
  }
};

// tokens - put
// required data: id, extend
// optional data: none
_tokens.put = (data, callback) => {
  let {token, extend} = data.payload;
  // check for required data
  token =
    typeof token == 'string' && token.trim().length == 20
      ? token.trim()
      : false;
  extend = typeof extend == 'boolean' && extend == true ? true : false;

  if (token && extend) {
    // lookup token
    _data.read('.tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        // check if token has not expired
        if (tokenData.expire > Date.now()) {
          // set expiration 1hour from now
          tokenData.expire = Date.now() + 1000 * 60 * 60;

          // save new token expiration
          _data.update('.tokens', token, tokenData, err => {
            if (!err) {
              callback(200, {message: 'Token have been updated successfully'});
            } else {
              callback(500, {Error: 'Could not update token expiration'});
            }
          });
        } else {
          callback(400, {
            Error: 'This token can not be extended it has already expired'
          });
        }
      } else {
        callback(404, {Error: 'Not found'});
      }
    });
  } else {
    callback(400, {Error: 'Invalid data send'});
  }
};

// tokens - delete
// required data: id
// optional data: none
_tokens.delete = (data, callback) => {
  // get data from query string
  let {token} = data.queryStringObject;

  // check for required data
  token =
    typeof token == 'string' && token.trim().length == 20
      ? token.trim()
      : false;

  if (token) {
    // check if user exist
    _data.read('.tokens', token, (err, user) => {
      if (!err && user) {
        _data.delete('.tokens', token, err => {
          if (!err) {
            callback(200, {message: 'Token successfully deleted'});
          } else {
            callback(500, {Error: 'Could not delete token'});
          }
        });
      } else {
        callback(404, {message: 'Token not found'});
      }
    });
  } else {
    callback(400, {Error: 'No data was sent'});
  }
};

// verifying user with a token
_tokens.verifyToken = (token, email, callback) => {
  // look up the token
  _data.read('.tokens', token, (err, token) => {
    if (!err && token) {
      // check if the token is for the email, and it has not expired
      if (token.email == email && token.expire > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = _tokens;

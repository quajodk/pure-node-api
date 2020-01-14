/**
 * Handler for API endpoints
 */

//  Dependencies
const _tokens = require('../api/tokens');
const _users = require('../api/users');
const _eits = require('../api/eits');

// handlers object
const handlers = {};

// accepted methods for the handlers
handlers.acceptedMethods = ['post', 'get', 'put', 'delete'];

// index handler
handlers.index = (data, callback) => {
  if (data.method == 'get') {
    callback(200, {msg: 'Its working'});
  }
};

// users handler
handlers.users = (data, callback) => {
  const {method} = data;

  if (handlers.acceptedMethods.indexOf(method) > -1) {
    // pass it to the specified user sub handler
    _users.handleRequest(data, callback);
  }
};

// token handler
handlers.tokens = (data, callback) => {
  const {method} = data;
  if (handlers.acceptedMethods.indexOf(method) > -1) {
    // pass it to the specified user sub handler
    _tokens.handleRequest(data, callback);
  }
};

// eit handler
handlers.eits = (data, callback) => {
  const {method} = data;
  if (handlers.acceptedMethods.indexOf(method) > -1) {
    // pass it to the specified user sub handler
    _eits.handleRequest(data, callback);
  }
};

// notFound handler
handlers.notFound = (data, callback) => {
  callback(404, {name: 'page not found'});
};

// export module
module.exports = handlers;

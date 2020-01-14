/**
 * API Handler for Users
 */

//  Dependencies
const util = require('util');
const _data = require('../lib/data');
const helpers = require('../lib/helpers');

// users object
const _users = {};

// handle user request
_users.handleRequest = (data, callback) => {
  const {method} = data;
  const allowedMethods = ['post', 'get', 'put', 'delete'];
  if (allowedMethods.indexOf(method) > -1) {
    _users[method](data, callback);
  }
};

// user - post
// required data: email, password
_users.post = (data, callback) => {
  let {name, email, password} = data.payload;

  // check for data
  name =
    typeof name == 'string' && name.trim().length > 0 ? name.trim() : false;
  email =
    typeof email == 'string' && email.trim().length > 0 ? email.trim() : false;
  password =
    typeof password == 'string' && password.trim().length > 0
      ? password.trim()
      : false;
  console.log(name);
  if (name && email && password) {
    // create id for the user
    const id = helpers.createRandomID(20);
    const fileName = email.split('@')[0];
    // check if the user don't already exist
    _data.read('users', fileName, (err, user) => {
      if (!err && user) {
        callback(400, {Error: 'User already exist'});
      } else {
        // hash the password
        const hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // create user object
          const userData = {
            id,
            name,
            email,
            hashedPassword
          };

          // create the user
          _data.create('users', fileName, userData, err => {
            if (!err) {
              callback(201, {message: 'User was created'});
            } else {
              callback(500, {Error: 'Could not create new user'});
            }
          });
        } else {
          callback(500);
        }
      }
    });
  } else {
    callback(400, {Error: 'Missing required data'});
  }
};

// user - get
// required data: email
// @TODO: authorization and authentication
_users.get = (data, callback) => {
  let {email} = data.queryStringObject;

  email =
    typeof email == 'string' && email.trim().length ? email.trim() : false;

  if (email) {
    const fileName = email.split('@')[0];
    // look up the id
    _data.read('users', fileName, (err, data) => {
      if (!err && data) {
        // remove password from the user data
        delete data.hashedPassword;
        callback(200, data);
      } else {
        callback(404, {Error: 'User was not found'});
      }
    });
  } else {
    // List of all users
    // users - get all
    _data.list('users', (err, users) => {
      if (!err && users && users.length > 0) {
        let userArray = users.map(user => {
          delete user.hashedPassword;
          return util.promisify(_data.read)('users', user);
        });

        Promise.all(userArray).then(data => {
          callback(200, data);
        });
      } else {
        callback(404, {Error: 'No users available'});
      }
    });
  }
};

// user - put
// require data: email
// optional data: name, password
// @TODO: authorization and authentication
_users.put = (data, callback) => {
  let {email, password} = data.payload;

  typeof email == 'string' && email.trim().length > 0 ? email.trim() : false;
  password =
    typeof password == 'string' && password.trim().length > 0
      ? password.trim()
      : false;

  if (email) {
    const fileName = email.split('@')[0];
    // look up user
    _data.read('users', fileName, (err, user) => {
      if (!err && user) {
        // check if one of the optional data was sent
        if (name || password) {
          if (email) {
            user.email = email;
          }
          if (password) {
            // hash password before saving
            const newHash = helpers.hash(password);
            user.hashedPassword = newHash;
          }

          // save user to file
          _data.update('users', fileName, user, err => {
            if (!err) {
              callback(201, {message: 'User was updated successfully'});
            } else {
              callback(500, {Error: 'Could not update user'});
            }
          });
        } else {
          callback(400, {Error: 'No data was sent for update'});
        }
      } else {
        callback(404, {Error: 'User was not found'});
      }
    });
  }
};

// user - delete
// required data: id
_users.delete = (data, callback) => {
  let {email} = data.queryStringObject;

  email =
    typeof email == 'string' && email.trim().length ? email.trim() : false;

  if (email) {
    const fileName = email.split('@')[0];
    // look up user
    _data.read('users', fileName, (err, user) => {
      if (!err && user) {
        _data.delete('users', fileName, err => {
          if (!err) {
            callback(200, {message: 'user was deleted successfully'});
          } else {
            callback(500, {Error: 'Could not delete user'});
          }
        });
      } else {
        callback(404, {Error: 'User was not found'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required data'});
  }
};

// export user
module.exports = _users;

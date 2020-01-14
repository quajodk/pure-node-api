/**
 * Handler for API endpoints
 */

//  Dependencies
const util = require('util');
const _data = require('./data');
const helpers = require('./helpers');

// handlers object
const handlers = {};

// accepted methods for the handlers
handlers.acceptedMethods = ['post', 'get', 'put', 'delete'];

// testing error handling
// @TODO: remove from api
handlers.error = (data, callback) => {
  const err = new Error('This is an error example');
  throw err;
};

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
    handlers._users[method](data, callback);
  }
};

// users sub handler object
handlers._users = {};

// user - post
// required data: email, password
handlers._users.post = (data, callback) => {
  let {email, password} = data.payload;

  // check for data
  email =
    typeof email == 'string' && email.trim().length > 0 ? email.trim() : false;
  password =
    typeof password == 'string' && password.trim().length > 0
      ? password.trim()
      : false;

  if (email && password) {
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
  }
};

// user - get
// required data: email
// @TODO: authorization and authentication
handlers._users.get = (data, callback) => {
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
          const arrData = util.promisify(_data.read('users', user));
          return arrData;
        });

        Promise.all(userArray).then(data => {
          console.log('the empty log:' + data);
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
// optional data: email, password
// @TODO: authorization and authentication
handlers._users.put = (data, callback) => {
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
        if (email || password) {
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
handlers._users.delete = (data, callback) => {
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

// token handler
handlers.tokens = (data, callback) => {
  const {method} = data;
  if (handlers.acceptedMethods.indexOf(method) > -1) {
    // pass it to the specified user sub handler
    handlers._tokens[method](data, callback);
  }
};

// token object
handlers._tokens = {};

// token - post
// required data: email, password
handlers._tokens.post = (data, callback) => {
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
          const token = helpers.createRandomID(15);
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
  }
};

// token - get
// required data: token
handlers._tokens.get = (data, callback) => {
  let {token} = data.queryStringObject;
  // check for required data
  id =
    typeof token == 'string' && token.trim().length == 15
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
handlers._tokens.put = (data, callback) => {
  let {token, extend} = data.payload;
  // check for required data
  token =
    typeof token == 'string' && token.trim().length == 15
      ? token.trim()
      : false;
  extend = typeof extend == 'boolean' && extend == true ? true : false;

  if (token && extend) {
    // lookup token
    _data.read('.tokens', token, (err, token) => {
      if (!err && token) {
        // check if token has not expired
        if (token.expire > Date.now()) {
          // set expiration 1hour from now
          token.expire = Date.now() + 1000 * 60 * 60;

          // save new token expiration
          _data.update('.tokens', token, token, err => {
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
handlers._tokens.delete = (data, callback) => {
  // get data from query string
  let {token} = data.queryStringObject;

  // check for required data
  token =
    typeof token == 'string' && token.trim().length == 15
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
handlers._tokens.verifyToken = (token, email, callback) => {
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

// eit handler
handlers.eits = (data, callback) => {
  const {method} = data;
  if (handlers.acceptedMethods.indexOf(method) > -1) {
    // pass it to the specified user sub handler
    handlers._eits[method](data, callback);
  }
};

// eit object
handlers._eits = {};

// eit - post
// required data: firstName, lastName, age, country
handlers._eits.post = (data, callback) => {
  let {firstName, lastName, age, country} = data.payload;

  firstName =
    typeof firstName == 'string' && firstName.trim().length > 0
      ? firstName.trim()
      : false;
  lastName =
    typeof lastName == 'string' && lastName.trim().length > 0
      ? lastName.trim()
      : false;
  age = typeof age == 'string' && age.trim().length > 0 ? age.trim() : false;
  country =
    typeof country == 'string' && country.trim().length > 0
      ? country.trim()
      : false;

  if (firstName && lastName && age && country) {
    // check the user creating eit has token
    let {token} = data.headers;

    token = typeof token == 'string' ? token : false;
    if (token) {
      // lookup user by token
      _data.read('.tokens', token, (err, data) => {
        if (!err && data) {
          const userWithToken = data.email;
          const userFile = userWithToken.split('@')[0];
          // get the user
          _data.read('users', userFile, (err, user) => {
            if (!err && user) {
              const userCreatedEits =
                typeof user.createdEits == 'object' &&
                user.createdEits instanceof Array
                  ? user.createdEits
                  : [];

              const id = helpers.createRandomID(20);
              // read the eits file to check
              _data.readEit('eits', (err, data) => {
                if (!err && data) {
                  const parsedData = helpers.parseJsonToObject(data);

                  let arrayData = [...parsedData];

                  const eitData = {
                    id,
                    firstName,
                    lastName,
                    age,
                    country,
                    createdBy: user.email
                  };

                  const dataToSave = [...arrayData, eitData];

                  _data.createEit('eits', dataToSave, err => {
                    if (!err) {
                      user.createdEits = userCreatedEits;
                      user.createdEits.push(id);

                      // update user file
                      _data.update('users', userFile, user, err => {
                        if (!err) {
                          callback(201, {
                            message: 'EIT was successfully created'
                          });
                        } else {
                          callback(500, {
                            Error: 'Could not update user with created EIT'
                          });
                        }
                      });
                    } else {
                      callback(500, {Error: 'Could not create EIT'});
                    }
                  });
                } else {
                  callback(500, err);
                }
              });
            } else {
              callback(403, {Error: 'Not authorized'});
            }
          });
        } else {
          callback(500, {Error: 'Error getting user with token'});
        }
      });
    }
  } else {
    callback(400, {Error: 'Missing required data'});
  }
};

// eits - get all or one
handlers._eits.get = (data, callback) => {
  let {id} = data.queryStringObject;

  id = typeof id == 'string' && id.trim().length ? id.trim() : false;

  if (id) {
    // get all eits
    _data.readEit('eits', (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);

        let arrayData = [...parsedData];
        const eit = arrayData.find(eit => eit.id == id);
        // verify if user have token and was created by him
        let {token} = data.headers;
        token = typeof token == 'string' ? token : false;

        handlers._tokens.verifyToken(token, eit.createdBy, tokenIsValid => {
          if (tokenIsValid) {
            callback(200, eit);
          } else {
            callback(403, {Error: 'Not authorized'});
          }
        });
      } else {
        callback(404, {Error: 'Eit was found'});
      }
    });
  } else {
    // get all eits
    _data.readEit('eits', (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);
        callback(200, parsedData);
      } else {
        callback(500, {Error: 'Could not read file, or eit(s) was found'});
      }
    });
  }
};

// eit - put
// require data: id
// optional data: firstName, lastName, age, country
handlers._eits.put = (data, callback) => {
  let {id, firstName, lastName, age, country} = data.payload;

  id = typeof id == 'string' && id.trim().length ? id.trim() : false;
  firstName =
    typeof firstName == 'string' && firstName.trim().length > 0
      ? firstName.trim()
      : false;
  lastName =
    typeof lastName == 'string' && lastName.trim().length > 0
      ? lastName.trim()
      : false;
  age = typeof age == 'string' && age.trim().length > 0 ? age.trim() : false;
  country =
    typeof country == 'string' && country.trim().length > 0
      ? country.trim()
      : false;

  if (id) {
    // get all eits
    _data.readEit('eits', (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);

        let arrayData = [...parsedData];
        const eit = arrayData.find(eit => eit.id == id);
        if (eit) {
          // verify if user have token and was created by him
          let {token} = data.headers;
          token = typeof token == 'string' ? token : false;

          handlers._tokens.verifyToken(token, eit.createdBy, tokenIsValid => {
            if (tokenIsValid) {
              // any available data to update
              if (firstName || lastName || age || country) {
                if (firstName) {
                  eit.firstName = firstName;
                }
                if (lastName) {
                  eit.lastName = lastName;
                }
                if (age) {
                  eit.age = age;
                }
                if (country) {
                  eit.country = country;
                }

                // get the filter out the updating eit
                const otherEits = arrayData.filter(eit => eit.id !== id);
                const dataToSave = [...otherEits, eit];
                // update eit file
                _data.createEit('eits', dataToSave, err => {
                  if (!err) {
                    callback(201, {message: 'EIT was updated'});
                  } else {
                    callback(500, {Error: 'Could not create EIT'});
                  }
                });
              } else {
                callback(400, {Error: 'No data sent to update eit'});
              }
            } else {
              callback(403, {Error: 'Not authorized'});
            }
          });
        } else {
          callback(404, {Error: 'Could not find specified EIT'});
        }
      } else {
        callback(500, {Error: 'Could not read file, or eit(s) was found'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required filed'});
  }
};

// eit - delete
// required data: id
handlers._eits.delete = (data, callback) => {
  let {id} = data.queryStringObject;

  id = typeof id == 'string' && id.trim().length ? id.trim() : false;

  if (id) {
    // get all eits
    _data.readEit('eits', (err, resData) => {
      if (!err && resData) {
        const parsedData = helpers.parseJsonToObject(resData);

        let arrayData = [...parsedData];
        const eit = arrayData.find(eit => eit.id == id);
        if (eit) {
          // verify if user have token and was created by him

          let {token} = data.headers;
          token = typeof token == 'string' ? token : false;

          handlers._tokens.verifyToken(token, eit.createdBy, tokenIsValid => {
            if (tokenIsValid) {
              const eitToDelete = arrayData.indexOf(eit);

              arrayData.splice(eitToDelete, 1);
              // read back to the file
              _data.createEit('eits', arrayData, err => {
                if (!err) {
                  // delete it from the user as well
                  const userFileName = eit.createdBy.split('@')[0];
                  _data.read('users', userFileName, (err, user) => {
                    if (!err && user) {
                      const userCreatedEits =
                        typeof user.createdEits == 'object' &&
                        user.createdEits instanceof Array
                          ? user.createdEits
                          : [];
                      const eitDataToDelete = userCreatedEits.indexOf(eit.id);

                      // delete from array
                      if (eitDataToDelete > -1) {
                        userCreatedEits.splice(eitDataToDelete, 1);
                        // re-save user
                        _data.update('users', userFileName, user, err => {
                          if (!err) {
                            callback(200, {
                              message: 'EIT was successfully removed'
                            });
                          } else {
                            callback(500, {Error: 'Error occurred deleting'});
                          }
                        });
                      } else {
                        callback(403, {
                          Error: 'User did not create specified EIT'
                        });
                      }
                    } else {
                      callback(500, {
                        Error: 'Can not delete EIT from user data'
                      });
                    }
                  });
                } else {
                  callback(500, {Error: 'Could not delete EIT'});
                }
              });
            } else {
              callback(403, {Error: 'Not authorized'});
            }
          });
        } else {
          callback(500, {Error: 'Error deleting EIT'});
        }
      } else {
        callback(500, {Error: 'Could not read file, or eit(s) was found'});
      }
    });
  } else {
    callback(400, {Error: 'Missing required filed'});
  }
};

// notFound handler
handlers.notFound = (data, callback) => {
  callback(404, {name: 'page not found'});
};

// export module
module.exports = handlers;

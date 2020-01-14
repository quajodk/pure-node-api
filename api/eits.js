/**
 * API Handler for EIT
 */

//  Dependencies
const _data = require('../lib/data');
const helpers = require('../lib/helpers');
const _tokens = require('./tokens');

// eit object
_eits = {};

// handle the request
_eits.handleRequest = (data, callback) => {
  const {method} = data;
  const allowedMethods = ['post', 'get', 'put', 'delete'];
  if (allowedMethods.indexOf(method) > -1) {
    _eits[method](data, callback);
  }
};

// eit - post
// required data: firstName, lastName, age, country
_eits.post = (data, callback) => {
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
_eits.get = (data, callback) => {
  let {id} = data.queryStringObject;
  let {token} = data.headers;

  id = typeof id == 'string' && id.trim().length ? id.trim() : false;

  if (id) {
    // get all eits
    _data.readEit('eits', (err, data) => {
      if (!err && data) {
        const parsedData = helpers.parseJsonToObject(data);

        let arrayData = [...parsedData];
        const eit = arrayData.find(eit => eit.id == id);
        // verify if user have token and was created by user

        token = typeof token == 'string' ? token : false;

        _tokens.verifyToken(token, eit.createdBy, tokenIsValid => {
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
_eits.put = (data, callback) => {
  let {id, firstName, lastName, age, country} = data.payload;
  let {token} = data.headers;

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

          token = typeof token == 'string' ? token : false;

          _tokens.verifyToken(token, eit.createdBy, tokenIsValid => {
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
_eits.delete = (data, callback) => {
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

          _tokens.verifyToken(token, eit.createdBy, tokenIsValid => {
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

// export eits
module.exports = _eits;

/**
 * Data manipulation for the API
 */

//  Dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// lib object
const lib = {};

// base direct for the file
lib.baseDir = path.join(__dirname, '/../data/');

// EIT file logic
// create EIT file
lib.createEit = (file, data, callback) => {
  const stringData = JSON.stringify(data);
  // write file and close the file
  fs.writeFile(`${lib.baseDir}${file}.json`, stringData, err => {
    if (!err) {
      callback(false);
    } else {
      callback('Error writing data to file');
    }
  });
};

// update file
lib.updateEit = (file, data, callback) => {
  fs.open(`${lib.baseDir}${file}.json`, 'a+', (err, fd) => {
    if (!err && fd) {
      // truncate file
      fs.truncate(`${lib.baseDir}${file}.json`, err => {
        if (!err) {
          // write data to file and close it
          fs.writeFile(fd, data, err => {
            if (!err) {
              // close file
              fs.close(fd, err => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              });
            } else {
              callback('Error updating file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Error opening file');
    }
  });
};

// read eit file
lib.readEit = (file, callback) => {
  fs.readFile(`${lib.baseDir}${file}.json`, 'utf8', (err, data) => {
    if (!err && data && data.length > 0) {
      callback(false, data);
    } else {
      callback('No Eit available');
    }
  });
};

// read files
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
    if (!err && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(err, data);
    }
  });
};

// append to a file
lib.append = (file, data, callback) => {
  // open to append
  fs.open(`${lib.baseDir}${file}.json`, 'a', (err, fd) => {
    if (!err && fd) {
      // append the data
      fs.appendFile(fd, `${data}\n`, err => {
        if (!err) {
          fs.close(fd, err => {
            if (!err) {
              callback(false);
            } else {
              callback(err);
            }
          });
        } else {
          callback(err);
        }
      });
    } else {
      callback(err);
    }
  });
};

// create file
lib.create = (dir, file, data, callback) => {
  // open the file to write
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fd) => {
    if (!err && fd) {
      // convert to string
      const stringData = JSON.stringify(data);
      // write file and close the file
      fs.writeFile(fd, stringData, err => {
        if (!err) {
          fs.close(fd, err => {
            if (!err) {
              callback(false);
            } else {
              callback('Error occurred closing file');
            }
          });
        } else {
          callback('Error writing data to file');
        }
      });
    } else {
      callback('Could not create a new file, it may already exist');
    }
  });
};

// update file
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'a+', (err, fd) => {
    if (!err && fd) {
      // convert to string
      const stringData = JSON.stringify(data);

      // truncate file
      fs.truncate(`${lib.baseDir}${dir}/${file}.json`, err => {
        if (!err) {
          // write data to file and close it
          fs.writeFile(fd, stringData, err => {
            if (!err) {
              // close file
              fs.close(fd, err => {
                if (!err) {
                  callback(false);
                } else {
                  callback('Error closing the file');
                }
              });
            } else {
              callback('Error updating file');
            }
          });
        } else {
          callback('Error truncating file');
        }
      });
    } else {
      callback('Error opening file');
    }
  });
};

// delete file
lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, err => {
    if (!err) {
      callback(false);
    } else {
      callback('File could not be deleted');
    }
  });
};

// read files in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir}${dir}/`, (err, data) => {
    if (!err && data && data.length > 0) {
      //  array for list
      const returnedList = [];
      data.forEach(file => {
        returnedList.push(file.replace('.json', ''));
      });
      callback(false, returnedList);
    } else {
      callback(err, data);
    }
  });
};

// export lib
module.exports = lib;

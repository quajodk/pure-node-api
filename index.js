/**
 * Primary API file
 */

//  Dependencies
const server = require('./lib/server');

// app object
const app = {};

// init app
app.init = () => {
  server.init();
};

// start app
app.init();

// export app
module.exports = app;

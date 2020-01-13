/**
 * API configuration file
 */

// env object
const env = {};

// dev env
env.development = {
  PORT: 3000,
  env: 'development',
  hashingSecret: 'someFUckingsEcret!'
};

// production env
// dev env
env.production = {
  PORT: 4000,
  env: 'production',
  hashingSecret: 'someFUckingsEcret!'
};

// determine which environment to export
const currentEvn =
  typeof process.env.NODE_ENV == 'string'
    ? process.env.NODE_ENV.toLowerCase()
    : '';

// check the current environment, if none default to development
const exportEnv =
  typeof env[currentEvn] == 'object' ? env[currentEvn] : env.development;

// export env
module.exports = exportEnv;

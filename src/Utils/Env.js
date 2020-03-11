const PRODUCTION_NODE_ENV = 'production';
const DEVELOPMENT_NODE_ENV = 'development';
const DEFAULT_NODE_ENV = PRODUCTION_NODE_ENV;

/**
 * Sets up the `NODE_ENV` upon import.
 * */
process.env = !!process.env ? process.env : {};
process.env.NODE_ENV = !!process.env.NODE_ENV ? process.env.NODE_ENV : DEFAULT_NODE_ENV;

/**
 * Environment related values.
 * */
module.exports = {
  /**
   * The default value for `ENV.NODE_ENV`.
   * @type {string}
   * */
  DEFAULT_NODE_ENV,
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV,
  /**
   * The current process environment object.
   * @type {Object}
   * */
  ENV: process.env
};

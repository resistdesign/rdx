const PRODUCTION_NODE_ENV = 'production';
const DEVELOPMENT_NODE_ENV = 'development';
const DEFAULT_NODE_ENV = PRODUCTION_NODE_ENV;

process.env = !!process.env ? process.env : {};
process.env.NODE_ENV = !!process.env.NODE_ENV ? process.env.NODE_ENV : DEFAULT_NODE_ENV;

export const ENV_VARS = {
  DEFAULT_NODE_ENV,
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV,
  ENV: process.env
};

export default ENV_VARS;

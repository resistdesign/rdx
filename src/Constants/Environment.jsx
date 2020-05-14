export const PRODUCTION_NODE_ENV = 'production';
export const DEVELOPMENT_NODE_ENV = 'development';
export const DEFAULT_NODE_ENV = PRODUCTION_NODE_ENV;

process.env = !!process.env ? process.env : {};
process.env.NODE_ENV = !!process.env.NODE_ENV ? process.env.NODE_ENV : DEFAULT_NODE_ENV;

const KNOWN_NODE_ENV_VALUE_MAP = {
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV
};

export const ENV_VARS: {
  DEFAULT_NODE_ENV: string,
  PRODUCTION_NODE_ENV: string,
  DEVELOPMENT_NODE_ENV: string,
  ENV: {
    NODE_ENV: $Values<typeof KNOWN_NODE_ENV_VALUE_MAP> | string,
    ...any
  }
} = {
  DEFAULT_NODE_ENV,
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV,
  ENV: process.env
};

export default ENV_VARS;

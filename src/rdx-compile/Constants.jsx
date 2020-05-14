import ENV_VARS from '../Constants/Environment';

export const {
  ENV: PROCESS_ENV,
  ENV: {
    NODE_ENV = ''
  } = {}
} = ENV_VARS;
export const PROCESS = {
  env: {
    ...PROCESS_ENV,
    NODE_ENV: process.env && process.env.NODE_ENV,
    DEBUG: process.env && process.env.DEBUG,
    IS: {
      [NODE_ENV]: true
    }
  }
};
export const BASE_DEFINITIONS = {
  'process.env.NODE_ENV': JSON.stringify(PROCESS.env.NODE_ENV),
  'process.env.DEBUG': JSON.stringify(PROCESS.env.DEBUG),
  [`process.env.IS.${NODE_ENV}`]: JSON.stringify(PROCESS.env.IS[NODE_ENV]),
  'process.env.IS': JSON.stringify(PROCESS.env.IS)
};
export const WEB_DEFINITIONS = {
  ...BASE_DEFINITIONS,
  'process.env': JSON.stringify(PROCESS.env),
  'process': JSON.stringify(PROCESS)
};

export const RUNTIMES = {
  ASYNC_NODE: 'async-node',
  NODE: 'node',
  NODE_WEBKIT: 'node-webkit',
  AWS_LAMBDA: 'aws-lambda',
  ELECTRON_MAIN: 'electron-main',
  ELECTRON_RENDERER: 'electron-renderer',
  WEB: 'web',
  WEBWORKER: 'webworker'
};

export const DEFINITION_USE_MAP = {
  [RUNTIMES.WEB]: WEB_DEFINITIONS,
  [RUNTIMES.WEBWORKER]: WEB_DEFINITIONS
};

export const DEFAULT_RUNTIME = RUNTIMES.NODE;

export const RUNTIME_TARGET_MAP = {
  [RUNTIMES.AWS_LAMBDA]: 'node'
};
export const NODE_RUNTIMES = [
  RUNTIMES.ASYNC_NODE,
  RUNTIMES.NODE,
  RUNTIMES.NODE_WEBKIT,
  RUNTIMES.AWS_LAMBDA,
  RUNTIMES.ELECTRON_MAIN,
  RUNTIMES.ELECTRON_RENDERER
];
export const RUNTIME_EXTERNALS_MAP = {
  [RUNTIMES.AWS_LAMBDA]: ['aws-sdk']
};

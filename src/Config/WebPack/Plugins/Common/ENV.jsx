import WebPack from 'webpack';

const DEVELOPMENT_ENV = 'development';
const CURRENT_ENV = process.env.NODE_ENV || DEVELOPMENT_ENV;
const PROCESS = {
  env: {
    NODE_ENV: process.env && process.env.NODE_ENV,
    DEBUG: process.env && process.env.DEBUG,
    IS: {
      [CURRENT_ENV]: true
    }
  }
};
const DEFINITIONS = {
  'process.env.NODE_ENV': JSON.stringify(PROCESS.env.NODE_ENV),
  'process.env.DEBUG': JSON.stringify(PROCESS.env.DEBUG),
  [`process.env.IS.${CURRENT_ENV}`]: JSON.stringify(PROCESS.env.IS[CURRENT_ENV]),
  'process.env.IS': JSON.stringify(PROCESS.env.IS),
  'process.env': JSON.stringify(PROCESS.env),
  'process': JSON.stringify(PROCESS)
};

export default function () {
  return [
    new WebPack.DefinePlugin(DEFINITIONS)
  ];
}

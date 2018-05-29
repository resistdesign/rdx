import WebPack from 'webpack';
import Flat from 'flat';

const DEVELOPMENT_ENV = 'development';
const CURRENT_ENV = process.env.NODE_ENV || DEVELOPMENT_ENV;
const DEFINITIONS = Flat({
  process: {
    env: {
      NODE_ENV: process.env && process.env.NODE_ENV,
      DEBUG: process.env && process.env.DEBUG,
      IS: {
        [CURRENT_ENV]: true
      }
    }
  }
});
const DEFINITIONS_WITH_JSON_VALUES = Object
  .keys(DEFINITIONS)
  .reduce((acc, k) => {
    acc[k] = JSON.stringify(DEFINITIONS[k]);

    return acc;
  }, {});

export default function () {
  return [
    new WebPack.DefinePlugin(DEFINITIONS_WITH_JSON_VALUES)
  ];
}

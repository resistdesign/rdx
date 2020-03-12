const {
  getFullTargetPath
} = require('./Path');

const PACKAGE_FILE_NAME = 'package.json';
const FULL_PACKAGE_PATH = getFullTargetPath(PACKAGE_FILE_NAME);
const CLI_CONFIG_NAME = 'rdx';

const getPackage = () => {
  let packageObject = {
    name: 'JSXLibrary'
  };

  try {
    packageObject = require(FULL_PACKAGE_PATH);
  } catch (error) {
    // Ignore.
  }

  return packageObject;
};
const getOptions = (command = '') => {
  const {
    [CLI_CONFIG_NAME]: {
      [command]: options = {}
    } = {}
  } = getPackage();

  return options;
};
const getMergedOptions = (command = '', explicitExistingOptions = {}) => {
  const packageOptions = getOptions(command);
  const {
    args: packageArgs = []
  } = packageOptions;
  const {
    args: explicitArgs = []
  } = explicitExistingOptions;
  const args = explicitArgs.length > 0 ? explicitArgs : packageArgs;

  return {
    ...packageOptions,
    ...explicitExistingOptions,
    args
  };
};

module.exports = {
  PACKAGE_FILE_NAME,
  FULL_PACKAGE_PATH,
  CLI_CONFIG_NAME,
  getPackage,
  getOptions,
  getMergedOptions
};

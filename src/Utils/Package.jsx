import { getFullTargetPath } from './Path';

export const PACKAGE_FILE_NAME = 'package.json';

export const FULL_PACKAGE_PATH = getFullTargetPath(PACKAGE_FILE_NAME);

export const CLI_CONFIG_NAME = 'rdx';

export const getPackage = () => {
  try {
    return require(FULL_PACKAGE_PATH);
  } catch (error) {
    return undefined;
  }
};

export const getOptions = (command = '') => {
  const {
    [CLI_CONFIG_NAME]: {
      [command]: options = {}
    } = {}
  } = getPackage();

  return options;
};

export const getMergedOptions = (command = '', explicitExistingOptions = {}) => {
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

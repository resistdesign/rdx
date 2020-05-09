import { CWD, getFullTargetPath } from './Path';

export const PACKAGE_FILE_NAME = 'package.json';

export const CLI_CONFIG_NAME = 'rdx';

export const getPackage = (cwd = CWD) => {
  try {
    return require(
      getFullTargetPath(
        PACKAGE_FILE_NAME,
        CWD
      )
    );
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

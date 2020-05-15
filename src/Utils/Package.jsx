import {CWD, getFullTargetPath} from './Path';
import {readFile, writeFile} from './File';

export const PACKAGE_FILE_NAME = 'package.json';

export const CLI_CONFIG_NAME = 'rdx';

export const getPackage = async ({
                                   cwd = CWD
                                 }: {
  cwd?: string
} = {}) => await readFile({
  fullPath: getFullTargetPath(
    PACKAGE_FILE_NAME,
    cwd
  )
});

export const setPackage = async ({
                                   cwd = CWD,
                                   packageData: data
                                 }: {
  cwd?: string,
  packageData: string
} = {}) => await writeFile({
  fullPath: getFullTargetPath(
    PACKAGE_FILE_NAME,
    cwd
  ),
  data
});

export const getPackageObject = async ({
                                         cwd = CWD
                                       }: {
  cwd?: string
} = {}) => JSON.parse(
  await getPackage({cwd})
);

export const setPackageObject = async ({
                                         cwd = CWD,
                                         packageObject
                                       }: {
  cwd?: string,
  packageObject: Object
} = {}) => await setPackage({
  cwd,
  packageData: JSON.stringify(
    packageObject,
    null,
    '  '
  )
});

export const getCommandOptions = async ({
                                          command = '',
                                          cliConfigName = CLI_CONFIG_NAME,
                                          cwd = CWD
                                        }: {
  command: string,
  cliConfigName?: string,
  cwd?: string
} = {}) => {
  const {
    [cliConfigName]: {
      [command]: options = {}
    } = {}
  } = await getPackageObject({
    cwd
  });

  return options;
};

export const getMergedCommandOptions = async ({
                                                command = '',
                                                cliConfigName = CLI_CONFIG_NAME,
                                                cwd = CWD,
                                                suppliedOptions = {}
                                              }: {
  command: string,
  cliConfigName?: string,
  cwd?: string,
  suppliedOptions: Object
} = {}) => ({
  ...(await getCommandOptions({
    command,
    cliConfigName,
    cwd
  })),
  ...suppliedOptions
});

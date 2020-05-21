import {CWD, getFullTargetPath} from './Path';
import File from './File';

export const DEFAULT_PACKAGE_FILE_NAME = 'package.json';

export const DEFAULT_CLI_CONFIG_NAME = 'rdx';

export class Package {
  cwd: string;
  packageFileName: string;
  cliConfigName: string;
  fileUtils: File;

  constructor(config = {}) {
    Object.assign(this, config);

    this.cwd = this.cwd || CWD;
    this.packageFileName = this.packageFileName || DEFAULT_PACKAGE_FILE_NAME;
    this.cliConfigName = this.cliConfigName || DEFAULT_CLI_CONFIG_NAME;
    this.fileUtils = this.fileUtils || new File();
  }

  getPackage = async () => await this.fileUtils.readFile({
    path: getFullTargetPath(
      this.packageFileName,
      this.cwd
    )
  });

  setPackage = async ({
                        packageData: data
                      }: {
    packageData: string
  } = {}) => await this.fileUtils.writeFile({
    path: getFullTargetPath(
      this.packageFileName,
      this.cwd
    ),
    data
  });

  getPackageObject = async () => JSON.parse(await this.getPackage());

  setPackageObject = async ({
                              packageObject
                            }: {
    packageObject: Object
  } = {}) => await this.setPackage({
    packageData: JSON.stringify(
      packageObject,
      null,
      '  '
    )
  });

  getCommandOptions = async ({
                               command = ''
                             }: {
    command: string
  } = {}) => {
    const {
      [this.cliConfigName]: {
        [command]: options = {}
      } = {}
    } = await this.getPackageObject();

    return options;
  };

  getMergedCommandOptions = async ({
                                     command = '',
                                     suppliedOptions = {}
                                   }: {
    command: string,
    suppliedOptions: Object
  } = {}) => ({
    ...(await this.getCommandOptions({command})),
    ...suppliedOptions
  });
}

export default Package;

// TODO: Add tests.

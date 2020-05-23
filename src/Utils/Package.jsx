import {CWD, getFullTargetPath} from './Path';
import File from './File';

export const DEFAULT_PACKAGE_FILE_NAME = 'package.json';

export const DEFAULT_CLI_CONFIG_NAME = 'rdx';

export type FileAPI = {
  readFile: typeof File.prototype.readFile,
  writeFile: typeof File.prototype.writeFile,
  pathExists: typeof File.prototype.pathExists
};

export class Package {
  cwd: string;
  packageFileName: string;
  cliConfigName: string;
  fileAPI: FileAPI;

  constructor(config = {}) {
    Object.assign(this, config);

    this.cwd = this.cwd || CWD;
    this.packageFileName = this.packageFileName || DEFAULT_PACKAGE_FILE_NAME;
    this.cliConfigName = this.cliConfigName || DEFAULT_CLI_CONFIG_NAME;
    this.fileAPI = this.fileAPI || new File();
  }

  packageExists = async () => await this.fileAPI.pathExists({
    path: getFullTargetPath(
      this.packageFileName,
      this.cwd
    )
  });

  getPackage = async () => await this.fileAPI.readFile({
    path: getFullTargetPath(
      this.packageFileName,
      this.cwd
    )
  });

  setPackage = async ({
                        packageData: data
                      }: {
    packageData: string
  } = {}) => await this.fileAPI.writeFile({
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

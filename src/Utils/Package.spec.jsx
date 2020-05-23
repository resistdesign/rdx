import Path from 'path';
import expect from 'expect.js';
import {includeParentLevels} from '../../TestUtils';
import {getFullTargetPath} from './Path';
import Package, {
  DEFAULT_CLI_CONFIG_NAME,
  DEFAULT_PACKAGE_FILE_NAME
} from './Package';
import type {FileAPI} from './Package';

let SUPPLIED_READ_INPUT,
  SUPPLIED_WRITE_INPUT,
  PACKAGE_INSTANCE: Package;

const CURRENT_WORKING_DIRECTORY = '/test/dir';
const FULL_PACKAGE_PATH = getFullTargetPath(DEFAULT_PACKAGE_FILE_NAME, CURRENT_WORKING_DIRECTORY);
const APP_COMMAND_NAME = 'app';
const APP_COMMAND_OPTIONS = {
  args: [
    'purple',
    'tornado'
  ],
  icons: true,
  defaultApp: true,
  littleRedCar: 'AMAZING!'
};
const PACKAGE_OBJECT = {
  name: 'My Fancy Package',
  scripts: {},
  dependencies: {},
  [DEFAULT_CLI_CONFIG_NAME]: {
    [APP_COMMAND_NAME]: APP_COMMAND_OPTIONS
  }
};
const READ_OUTPUT = JSON.stringify(
  PACKAGE_OBJECT,
  null,
  '  '
);
const DIR_WITHOUT_PACKAGE = '/path/to/non-existing';
const PATH_EXISTENCE_MAP = {
  [CURRENT_WORKING_DIRECTORY]: true
};
const FILE_API: FileAPI = {
  pathExists: async ({path} = {}) => !!PATH_EXISTENCE_MAP[Path.dirname(path)],
  readFile: async (input = {}) => {
    SUPPLIED_READ_INPUT = input;

    return READ_OUTPUT;
  },
  writeFile: async (input = {}) => {
    SUPPLIED_WRITE_INPUT = input;
  }
};

const beforeEach = () => {
  SUPPLIED_READ_INPUT = undefined;
  SUPPLIED_WRITE_INPUT = undefined;
  PACKAGE_INSTANCE = new Package({
    cwd: CURRENT_WORKING_DIRECTORY,
    packageFileName: DEFAULT_PACKAGE_FILE_NAME,
    cliConfigName: DEFAULT_CLI_CONFIG_NAME,
    fileAPI: FILE_API
  });
};

export default includeParentLevels(
  __dirname,
  {
    Package: {
      beforeEach,
      'should be a class': () => {
        expect(Package).to.be.a(Function);
      },
      'should assign properties on construction': () => {
        expect(PACKAGE_INSTANCE.cwd).to.be(CURRENT_WORKING_DIRECTORY);
        expect(PACKAGE_INSTANCE.packageFileName).to.be(DEFAULT_PACKAGE_FILE_NAME);
        expect(PACKAGE_INSTANCE.cliConfigName).to.be(DEFAULT_CLI_CONFIG_NAME);
        expect(PACKAGE_INSTANCE.fileAPI).to.be(FILE_API);
      },
      packageExists: {
        'should determine if a package file exists': async () => {
          const testDirHasPackage = await PACKAGE_INSTANCE.packageExists();

          PACKAGE_INSTANCE.cwd = DIR_WITHOUT_PACKAGE;

          const dirWithoutPackageHasPackage = await PACKAGE_INSTANCE.packageExists();

          expect(testDirHasPackage).to.be.ok();
          expect(dirWithoutPackageHasPackage).to.not.be.ok();
        }
      },
      getPackage: {
        'should get a package file content string': async () => {
          const packageString = await PACKAGE_INSTANCE.getPackage();
          const {
            path,
            binary
          } = SUPPLIED_READ_INPUT;

          expect(packageString).to.be(READ_OUTPUT);
          expect(path).to.be(FULL_PACKAGE_PATH);
          expect(binary).to.not.be(true);
        }
      },
      setPackage: {
        'should save a package file content string': async () => {
          await PACKAGE_INSTANCE.setPackage({packageData: READ_OUTPUT});

          const {
            path,
            data,
            binary
          } = SUPPLIED_WRITE_INPUT;

          expect(data).to.be(READ_OUTPUT);
          expect(path).to.be(FULL_PACKAGE_PATH);
          expect(binary).to.not.be(true);
        }
      },
      getPackageObject: {
        'should get a package object': async () => {
          const packageObject = await PACKAGE_INSTANCE.getPackageObject();

          expect(packageObject).to.eql(PACKAGE_OBJECT);
        }
      },
      setPackageObject: {
        'should save a package object': async () => {
          await PACKAGE_INSTANCE.setPackageObject({packageObject: PACKAGE_OBJECT});

          const {
            data
          } = SUPPLIED_WRITE_INPUT;

          expect(data).to.be(READ_OUTPUT);
        }
      },
      getCommandOptions: {
        'should get an options object for the given command': async () => {
          const commandOptions = await PACKAGE_INSTANCE.getCommandOptions({command: APP_COMMAND_NAME});

          expect(commandOptions).to.eql(APP_COMMAND_OPTIONS);
        }
      },
      getMergedCommandOptions: {
        'should get a merged options object for the given command and supplied options object': async () => {
          const suppliedOptions = {
            args: [
              'tan',
              'nugget'
            ],
            balloon: 'HOT AIR',
            defaultApp: false
          };
          const mergedCommandOptions = await PACKAGE_INSTANCE.getMergedCommandOptions({
            command: APP_COMMAND_NAME,
            suppliedOptions
          });
          const MERGED_COMMAND_OPTIONS = {
            ...APP_COMMAND_OPTIONS,
            ...suppliedOptions
          };

          expect(mergedCommandOptions).to.eql(MERGED_COMMAND_OPTIONS);
        }
      }
    }
  }
);

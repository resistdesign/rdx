import expect from 'expect.js';
import {includeParentLevels} from '../../TestUtils';
import Package, {
  DEFAULT_CLI_CONFIG_NAME,
  DEFAULT_PACKAGE_FILE_NAME
} from './Package';

let SUPPLIED_READ_INPUT,
  SUPPLIED_WRITE_INPUT,
  PACKAGE_INSTANCE;

const CURRENT_WORKING_DIRECTORY = '/test/dir';
const PACKAGE_OBJECT = {
  name: 'My Fancy Package',
  scripts: {},
  dependencies: {}
};
const READ_OUTPUT = JSON.stringify(
  PACKAGE_OBJECT,
  null,
  '  '
);
const FILE_API = {
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
      getPackage: {
        'should be a function': () => {
          expect(PACKAGE_INSTANCE.getPackage).to.be.a(Function);
        }
      },
      setPackage: {
        'should be a function': () => {
          expect(PACKAGE_INSTANCE.setPackage).to.be.a(Function);
        }
      },
      getPackageObject: {
        'should be a function': () => {
          expect(PACKAGE_INSTANCE.getPackageObject).to.be.a(Function);
        }
      },
      setPackageObject: {
        'should be a function': () => {
          expect(PACKAGE_INSTANCE.setPackageObject).to.be.a(Function);
        }
      },
      getCommandOptions: {
        'should be a function': () => {
          expect(PACKAGE_INSTANCE.getCommandOptions).to.be.a(Function);
        }
      },
      getMergedCommandOptions: {
        'should be a function': () => {
          expect(PACKAGE_INSTANCE.getMergedCommandOptions).to.be.a(Function);
        }
      }
    }
  }
);

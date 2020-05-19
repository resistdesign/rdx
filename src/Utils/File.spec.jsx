import expect from 'expect.js';
import FS from 'memfs';
import {includeParentLevels} from '../../TestUtils';
import File from './File';

const FAKE_DIRECTORY = '/lots/';
const FAKE_FILE_LIST = [
  '/lots/of/really/fake',
  '/lots/of/really/fake/files',
  '/lots/of/really/fake/files/here.jsx'
];

let FILE_INSTANCE,
  CAPTURED_GLOB_SEARCH_OPTIONS;

const globSearch = async (options = {}) => {
  CAPTURED_GLOB_SEARCH_OPTIONS = options;

  return FAKE_FILE_LIST;
};

const beforeEach = () => {
  FILE_INSTANCE = new File({
    cwd: FAKE_DIRECTORY,
    globSearch,
    fileSystem: FS
  });
  CAPTURED_GLOB_SEARCH_OPTIONS = undefined;
};

export default includeParentLevels(
  __dirname,
  {
    'File': {
      beforeEach,
      'should be a class': () => {
        expect(File).to.be.a(Function);
      },
      'getFileList': {
        'should recursively list all files in a directory': async () => {
          const fileList = await FILE_INSTANCE.listDirectory({
            directory: FAKE_DIRECTORY
          });
          const {
            pattern,
            cwd
          } = CAPTURED_GLOB_SEARCH_OPTIONS;

          expect(fileList).to.equal(FAKE_FILE_LIST);
          expect(pattern).to.equal(`${FAKE_DIRECTORY}**/*`);
          expect(cwd).to.be(FAKE_DIRECTORY);
        }
      }
    }
  }
);

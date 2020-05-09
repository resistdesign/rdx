import expect from 'expect.js';
import Path from 'path';
import { includeParentLevels } from '../../TestUtils';
import { getFileList } from './File';
import { BASE_TEMPLATE_DIR } from '../rdx-app/Constants';

export default includeParentLevels(
  __dirname,
  {
    'File': {
      'getFileList': {
        'should recursively list all files in a directory': () => {
          const directory = BASE_TEMPLATE_DIR;
          const appJSXAssetPath = Path.join(directory, '___APP_CLASS_NAME___.jsx');
          const faviconPath = Path.join(directory, '___APP_PATH_NAME___-icons', 'favicon.ico');
          const fileList = getFileList(directory);

          expect(fileList).to.contain(appJSXAssetPath);
          expect(fileList).to.contain(faviconPath);
        }
      }
    }
  }
);

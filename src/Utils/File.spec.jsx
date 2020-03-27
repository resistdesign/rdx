import expect from 'expect.js';
import Path from 'path';
import { includeParentLevels } from '../../TestUtils';
import { getFileList } from './File';

export default includeParentLevels(
  __dirname,
  {
    'File': {
      'getFileList': {
        'should recursively list all files in a directory': () => {
          const projectRootPath = process.cwd();
          const directory = Path.join(projectRootPath, 'src', 'App', 'Assets');
          const appJSXAssetPath = Path.join(directory, 'App.jsx');
          const faviconPath = Path.join(directory, 'app-icons', 'favicon.ico');
          const fileList = getFileList(directory);

          console.log(fileList);

          expect(fileList).to.contain(appJSXAssetPath);
          expect(fileList).to.contain(faviconPath);
        }
      }
    }
  }
);
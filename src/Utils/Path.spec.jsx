import expect from 'expect.js';
import { includeParentLevels } from '../../TestUtils';
import { getRelativePath } from './Path';

export default includeParentLevels(
  __dirname,
  {
    'Path': {
      'getRelativePath': {
        'should return a relative path based on a parent path': () => {
          const path = '/a/b/c/d/e/f';
          const fromPath = '/a/b/c';
          const relativePath = getRelativePath(path, fromPath);
          const expectedPath = 'd/e/f';

          expect(relativePath).to.be(expectedPath);
        }
      }
    }
  }
);

import expect from 'expect.js';
import { interpolateTemplateValues, pathIsDirectory, pathIsTemplateSource } from './Template';
import { includeParentLevels } from '../../../TestUtils';

export default includeParentLevels(
  __dirname,
  {
    'Template': {
      'pathIsTemplateSource': {
        'should return false for non-template file types': () => {
          expect(pathIsTemplateSource('/folder/file.png')).to.be(false);
        },
        'should return true for template file types': () => {
          expect(pathIsTemplateSource('/folder/file.html')).to.be(true);
        }
      },
      'pathIsDirectory': {
        'should detect paths without file extensions': () => {
          const pathIsDir = pathIsDirectory('/thing');
          const pathIsDir2 = pathIsDirectory('/thing.jpeg');

          expect(pathIsDir).to.be(true);
          expect(pathIsDir2).to.be(true);
        }
      },
      'interpolateTemplateValues': {
        'should interpolate values into a template string': () => {
          const template = '<body>___DOUBLE___</body>';
          const values = {
            DOUBLE: 'Are you a clone?'
          };
          const interpolated = interpolateTemplateValues(template, values);

          expect(interpolated).to.be('<body>Are you a clone?</body>');
        }
      }
    }
  }
);

import expect from 'expect.js';
import { interpolateTemplateValues, pathIsTemplateSource } from './Template';
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

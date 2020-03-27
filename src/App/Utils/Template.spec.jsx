import expect from 'expect.js';
import { interpolateTemplateValues } from './Template';

export default {
  'Template': {
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
};

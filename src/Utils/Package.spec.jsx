import expect from 'expect.js';
import {includeParentLevels} from '../../TestUtils';
import Package from './Package';

export default includeParentLevels(
  __dirname,
  {
    Package: {
      'should be a class': () => {
        expect(Package).to.be.a(Function);
      }
    }
  }
);

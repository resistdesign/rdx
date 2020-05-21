import {includeParentLevels} from '../../TestUtils';

export default includeParentLevels(
  __dirname,
  {
    Package: {
      'should be a class': () => {}
    }
  }
);

import expect from 'expect.js';
import { includeParentLevels } from '../../TestUtils';
import { getMergedInput } from './CommandArgs';

export default includeParentLevels(
  __dirname,
  {
    'CommandArgs': {
      'getMergedInput': () => {
        const defaultInputLevel = {
          args: [
            1,
            2
          ],
          icons: true,
          themeColor: '#ffffff'
        };
        const packageLevel = {
          args: [],
          themeColor: '#111111'
        };
        const packageCommandConfigLevel = {
          args: [
            3
          ],
          icons: false
        };
        const commandLineArgsLevel = {
          args: [
            3,
            4
          ],
          themeColor: '#777777'
        };
        const mergedInput = getMergedInput(
          defaultInputLevel,
          packageLevel,
          packageCommandConfigLevel,
          commandLineArgsLevel
        );
        const expectedInput = {
          args: [
            3,
            4
          ],
          icons: false,
          themeColor: '#777777'
        };

        expect(mergedInput).to.equal(expectedInput);
      }
    }
  }
);

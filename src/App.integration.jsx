import expect from 'expect.js';
import Path from 'path';
import FS from 'fs-extra';
import TEST_DIRECTORIES from '../TestConstants';
import App from './App';

export default {
  'App': {
    beforeEach: () => {
      FS.ensureDirSync(TEST_DIRECTORIES.TEST_APP);
    },
    afterEach: () => {
      FS.removeSync(TEST_DIRECTORIES.TEST_APP);
    },
    'should create app files in a project from template files': async function () {
      this.timeout(10 * 60 * 1000);// 10 minutes.
      const app = new App({
        currentWorkingDirectory: TEST_DIRECTORIES.TEST_APP,
        title: 'RDX Test App',
        description: 'A test application',
        themeColor: '#111111',
        baseDirectory: 'src',
        includeIcons: true,
        isDefaultApp: true,
        overwrite: true
      });
      const expectedAppClassName = 'RDXTestApp';

      await app.execute();

      const appCompFileContent = FS.readdirSync(
        Path.join(
          TEST_DIRECTORIES.TEST_APP,
          app.baseDirectory,
          `${expectedAppClassName}.jsx`
        ),
        {
          encoding: 'utf8'
        }
      );

      expect(appCompFileContent).to.contain(expectedAppClassName);
    }
  }
};

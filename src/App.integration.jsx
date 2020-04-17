import expect from 'expect.js';
import Path from 'path';
import FS from 'fs';
import TEST_DIRECTORIES from '../TestConstants';
import App from './App';

export default {
  'App': {
    beforeEach: () => {
      FS.mkdirSync(TEST_DIRECTORIES.TEST_APP, { recursive: true });
    },
    afterEach: () => {
      FS.rmdirSync(TEST_DIRECTORIES.TEST_APP, { recursive: true });
    },
    'should create app files in a project from template files': async () => {
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

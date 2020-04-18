import expect from 'expect.js';
import Path from 'path';
import FS from 'fs-extra';
import TEST_DIRECTORIES from '../TestConstants';
import App from './App';

export default {
  'App': {
    'should create app files in a project from template files': function (done) {
      FS.removeSync(TEST_DIRECTORIES.TEST_APP);
      FS.ensureDirSync(TEST_DIRECTORIES.TEST_APP);
      this.timeout(10 * 60 * 1000);// 10 minutes.
      const runTest = async () => {
        try {
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

          const appCompFileContent = FS.readFileSync(
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

          done();
        } catch (error) {
          done(error);
        }
      };

      runTest();
    }
  }
};

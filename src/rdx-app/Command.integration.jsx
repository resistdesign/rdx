import expect from 'expect.js';
import Path from 'path';
import FS from 'fs-extra';
import TEST_DIRECTORIES from '../../TestConstants';
import Command from './Command';
import { PACKAGE_FILE_NAME } from '../Utils/Package';
import { DEFAULT_APP_PACKAGE_DEPENDENCIES } from './Constants';

export default {
  'Command': {
    'should create app files in a project from template files': function (done) {
      FS.removeSync(TEST_DIRECTORIES.TEST_APP);
      FS.ensureDirSync(TEST_DIRECTORIES.TEST_APP);
      this.timeout(10 * 60 * 1000);// 10 minutes.
      const onDone = error => {
        FS.removeSync(TEST_DIRECTORIES.TEST_APP);
        done(error);
      };
      const runTest = async () => {
        try {
          const command = new Command({
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
          const expectedAppPathName = 'rdx-test-app';

          await command.execute();

          const appCompFileContent = FS.readFileSync(
            Path.join(
              TEST_DIRECTORIES.TEST_APP,
              command.baseDirectory,
              `${expectedAppClassName}.jsx`
            ),
            {
              encoding: 'utf8'
            }
          );
          const appPackageJsonFileContent = FS.readFileSync(
            Path.join(
              TEST_DIRECTORIES.TEST_APP,
              PACKAGE_FILE_NAME
            ),
            {
              encoding: 'utf8'
            }
          );
          const appHTMLFileContent = FS.readFileSync(
            Path.join(
              TEST_DIRECTORIES.TEST_APP,
              command.baseDirectory,
              `${expectedAppPathName}.html`
            ),
            {
              encoding: 'utf8'
            }
          );

          expect(appCompFileContent).to.contain(expectedAppClassName);
          expect(appPackageJsonFileContent).to.contain('"name": "test-app"');
          expect(appHTMLFileContent).to.contain('<!-- Icons -->');

          DEFAULT_APP_PACKAGE_DEPENDENCIES
            .forEach(d => {
              expect(appPackageJsonFileContent).to.contain(`"${d}"`);
            });

          onDone();
        } catch (error) {
          onDone(error);
        }
      };

      runTest();
    }
  }
};

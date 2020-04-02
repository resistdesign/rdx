import expect from 'expect.js';
import Path from 'path';
import { fs as MemFS } from 'memfs';
import { includeParentLevels } from '../TestUtils';
import App from './App';
import { BASE_TEMPLATE_DIR } from './App/Constants';

const FILE_SYSTEM_DRIVER = {
  ...MemFS,
  // Mimic fs-extra like driver.
  copy: async (fromPath = '', toPath = '') => new Promise((res, rej) => {
    MemFS.readFile(fromPath, { encoding: 'binary' }, (error1, data) => {
      if (!!error1) {
        rej(error1);
      } else {
        MemFS.mkdir(
          Path.dirname(toPath),
          (error2) => {
            if (!!error2) {
              rej(error2);
            } else {
              MemFS.writeFile(toPath, data, { encoding: 'binary' }, (error3) => {
                if (!!error3) {
                  rej(error3);
                } else {
                  res(true);
                }
              });
            }
          }
        );
      }
    });
  })
};
const BASIC_APP_CONFIG = {
  fileSystemDriver: FILE_SYSTEM_DRIVER,
  currentWorkingDirectory: 'dir',
  title: 'My App',
  description: 'This is an application.',
  themeColor: '#111111',
  baseDirectory: 'src',
  includeIcons: true,
  isDefaultApp: true,
  overwrite: false
};

export default includeParentLevels(
  __dirname,
  {
    'App': {
      'should configure properties on construction': () => {
        const app = new App(BASIC_APP_CONFIG);

        expect(app.fileSystemDriver).to.be(BASIC_APP_CONFIG.fileSystemDriver);
        expect(app.currentWorkingDirectory).to.be(BASIC_APP_CONFIG.currentWorkingDirectory);
        expect(app.title).to.be(BASIC_APP_CONFIG.title);
        expect(app.description).to.be(BASIC_APP_CONFIG.description);
        expect(app.themeColor).to.be(BASIC_APP_CONFIG.themeColor);
        expect(app.baseDirectory).to.be(BASIC_APP_CONFIG.baseDirectory);
        expect(app.includeIcons).to.be(BASIC_APP_CONFIG.includeIcons);
        expect(app.isDefaultApp).to.be(BASIC_APP_CONFIG.isDefaultApp);
        expect(app.overwrite).to.be(BASIC_APP_CONFIG.overwrite);
      },
      'getTemplateData': {
        'should build an object with data for app asset templates': () => {
          const app = new App(BASIC_APP_CONFIG);
          const templateData = app.getTemplateData();

          expect(templateData.APP_NAME).to.be('My App');
          expect(templateData.APP_PATH_NAME).to.be('my-app');
          expect(templateData.APP_CLASS_NAME).to.be('MyApp');
          expect(templateData.APP_DESCRIPTION).to.be('This is an application.');
          expect(templateData.THEME_COLOR).to.be('#111111');
        }
      },
      'getTemplateFilePaths': {
        'should list all of the paths to the default template files': async () => {
          const app = new App(BASIC_APP_CONFIG);
          const templateFilePaths = await app.getTemplateFilePaths();
          const containsIconFolderPaths = templateFilePaths
            .reduce((acc, p = '') => acc || p.indexOf('___APP_PATH_NAME___-icons') !== -1, false);

          expect(templateFilePaths).to.be.an(Array);
          expect(templateFilePaths.length).to.be.greaterThan(0);
          expect(containsIconFolderPaths).to.be(true);
        }
      },
      'getPathDestinationMap': {
        'should return a map with template file path keys and destination path values': () => {
          const app = new App(BASIC_APP_CONFIG);
          const appComponentAssetName = '___APP_CLASS_NAME___.jsx';
          const appComponentAssetPath = Path.join(BASE_TEMPLATE_DIR, appComponentAssetName);
          const appComponentAssetDestPath = Path.join(BASIC_APP_CONFIG.baseDirectory, appComponentAssetName);
          const templateFileDestinationPathMap = app.getPathDestinationMap([
            appComponentAssetPath
          ]);

          expect(templateFileDestinationPathMap).to.be.an(Object);
          expect(templateFileDestinationPathMap).to.have.key(appComponentAssetPath);
          expect(templateFileDestinationPathMap[appComponentAssetPath]).to.be(appComponentAssetDestPath);
        }
      },
      'getTemplateFileDestinationPathMap': {
        'should return a map with template file path keys and destination path values': async () => {
          const app = new App(BASIC_APP_CONFIG);
          const templateFileDestinationPathMap = await app.getTemplateFileDestinationPathMap();
          const appComponentAssetName = '___APP_CLASS_NAME___.jsx';
          const appComponentAssetPath = Path.join(BASE_TEMPLATE_DIR, appComponentAssetName);
          const appComponentAssetDestPath = Path.join(BASIC_APP_CONFIG.baseDirectory, appComponentAssetName);
          const {
            text: textPathMap
          } = templateFileDestinationPathMap;

          expect(templateFileDestinationPathMap).to.be.an(Object);
          expect(textPathMap).to.be.an(Object);
          expect(textPathMap).to.have.key(appComponentAssetPath);
          expect(textPathMap[appComponentAssetPath]).to.be(appComponentAssetDestPath);
        }
      },
      'readTextAssetFile': {
        'should read a template file': async () => {
          const templateFileDir = '/Assets';
          const templateFilePath = `${templateFileDir}/index.html`;
          const templateContent = '<html><body>TEMPLATE</body></html>';

          FILE_SYSTEM_DRIVER.mkdirSync(templateFileDir);
          FILE_SYSTEM_DRIVER.writeFileSync(templateFilePath, templateContent, { encoding: 'utf8' });

          const app = new App(BASIC_APP_CONFIG);
          const assetFileContent = await app.readTextAssetFile(templateFilePath);

          expect(assetFileContent).to.be(templateContent);
        }
      },
      'moveImageAssetFile': {
        'should move an image asset file from one path to another': async () => {
          const fromPath = '/Assets/test.jsx';
          const toPath = '/src/test-app.jsx';
          const fileContent = `export default {
            thisIs: {
              a: 'JS file'
            }
          };`;
          const app = new App(BASIC_APP_CONFIG);

          FILE_SYSTEM_DRIVER.writeFileSync(fromPath, fileContent, { encoding: 'utf8' });

          await app.moveImageAssetFile(fromPath, toPath);

          const destinationImageAssetContent = FILE_SYSTEM_DRIVER
            .readFileSync(toPath, { encoding: 'utf8' });

          expect(destinationImageAssetContent).to.be(fileContent);
        }
      }
    }
  }
);

import expect from 'expect.js';
import Path from 'path';
import FS from 'fs';
import { fs as MemFS } from 'memfs';
import { includeParentLevels } from '../TestUtils';
import App from './App';
import { BASE_TEMPLATE_DIR } from './App/Constants';

// TODO: Refactor BASIC_APP_CONFIG to not use any actual FS package.
// TODO: Refactor BASIC_APP_CONFIG to use a stubbed globFileSearch function.

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
          () => {
            MemFS.writeFile(toPath, data, { encoding: 'binary' }, (error2) => {
              if (!!error2) {
                rej(error2);
              } else {
                res(true);
              }
            });
          }
        );
      }
    });
  }),
  pathExists: async (path) => {
    try {
      await MemFS.accessSync(path);
      return true;
    } catch (error) {
      return false;
    }
  }
};
const BASIC_APP_CONFIG = {
  fileSystemDriver: FILE_SYSTEM_DRIVER,
  currentWorkingDirectory: '/dir',
  title: 'My App',
  description: 'This is an application.',
  themeColor: '#111111',
  baseDirectory: 'src',
  includeIcons: true,
  isDefaultApp: true,
  overwrite: false
};
const getProcessingSetup = async ({
                                    inputFilePath = '',
                                    inputFileContent,
                                    encoding = 'utf8',
                                    existingFiles = [],
                                    configOverrides = {}
                                  } = {}) => {
  const app = new App({
    ...BASIC_APP_CONFIG,
    ...configOverrides
  });
  const templateFilePathList = await app.getTemplateFilePaths();

  [
    ...templateFilePathList,
    ...existingFiles
  ]
    .forEach(tfp => {
      try {
        FILE_SYSTEM_DRIVER.mkdirSync(
          Path.dirname(tfp),
          {
            recursive: true
          }
        );
      } catch (error) {
        // Ignore.
      }

      FILE_SYSTEM_DRIVER.writeFileSync(
        tfp,
        'STUFF',
        {
          encoding: 'utf8'
        }
      );
    });

  if (!!inputFilePath) {
    FILE_SYSTEM_DRIVER.writeFileSync(
      inputFilePath,
      inputFileContent,
      {
        encoding
      }
    );
  }

  return {
    app,
    ...(await app.getTemplateFileDestinationPathMap())
  };
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
          const processedAppComponentAssetName = 'MyApp.jsx';
          const appComponentAssetPath = Path.join(BASE_TEMPLATE_DIR, appComponentAssetName);
          const appComponentAssetDestPath = Path.join(
            BASIC_APP_CONFIG.currentWorkingDirectory,
            BASIC_APP_CONFIG.baseDirectory,
            processedAppComponentAssetName
          );
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
          const processedAppComponentAssetName = 'MyApp.jsx';
          const appComponentAssetPath = Path.join(BASE_TEMPLATE_DIR, appComponentAssetName);
          const appComponentAssetDestPath = Path.join(
            BASIC_APP_CONFIG.currentWorkingDirectory,
            BASIC_APP_CONFIG.baseDirectory,
            processedAppComponentAssetName
          );
          const {
            textPathMap
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
      'writeTextAssetFile': {
        'should write a new text file': async () => {
          const templateFileDir = '/src';
          const templateFilePath = `${templateFileDir}/index.html`;
          const templateContent = '<html><body>TEMPLATE</body></html>';
          const app = new App(BASIC_APP_CONFIG);

          await app.writeTextAssetFile(templateFilePath, templateContent);

          const assetFileContent = FILE_SYSTEM_DRIVER.readFileSync(
            templateFilePath,
            {
              encoding: 'utf8'
            }
          );

          expect(assetFileContent).to.be(templateContent);
        }
      },
      'copyImageAssetFile': {
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

          await app.copyImageAssetFile(fromPath, toPath);

          const destinationImageAssetContent = FILE_SYSTEM_DRIVER
            .readFileSync(toPath, { encoding: 'utf8' });

          expect(destinationImageAssetContent).to.be(fileContent);
        }
      },
      'checkMapForExistingDestinations': {
        'should throw an error if a destination file exists': async () => {
          const existingDestinationPath = '/dir/src/my-app.html';
          const {
            app
          } = await getProcessingSetup({
            existingFiles: [existingDestinationPath]
          });

          let existenceError;

          const checkExistence = async () => {
            try {
              await app.checkMapForExistingDestinations({
                a: existingDestinationPath
              });
            } catch (error) {
              existenceError = error;
            }
          };

          await checkExistence();

          expect(existenceError).to.be.an(Error);
          expect(existenceError.message).to.be('Destination Exists: /dir/src/my-app.html');
        }
      },
      'processTextAssetFiles': {
        'should read, interpolate and write all text assets': async () => {
          const inputTemplateFilePath = `${BASE_TEMPLATE_DIR}/___APP_PATH_NAME___.html`;
          const inputTemplateContent = '<html><body>___APP_NAME___</body></html>';
          const outputTemplateFilePath = `/dir/src/my-app.html`;
          const outputTemplateContent = '<html><body>My App</body></html>';
          const {
            app,
            textPathMap = {}
          } = await getProcessingSetup({
            inputFilePath: inputTemplateFilePath,
            inputFileContent: inputTemplateContent
          });

          await app.processTextAssetFiles(textPathMap);

          const assetFileContent = FILE_SYSTEM_DRIVER.readFileSync(
            outputTemplateFilePath,
            {
              encoding: 'utf8'
            }
          );

          expect(assetFileContent).to.be(outputTemplateContent);
        }
      },
      'processImageAssetFiles': {
        'should copy template image files from source to destination': async () => {
          const inputImageFilePath = `${BASE_TEMPLATE_DIR}/___APP_PATH_NAME___-icons/favicon.ico`;
          const inputImageFileContent = FS.readFileSync(inputImageFilePath, { encoding: 'binary' });
          const outputImageFilePath = `/dir/src/my-app-icons/favicon.ico`;
          const {
            app,
            imagesPathMap = {}
          } = await getProcessingSetup({
            inputFilePath: inputImageFilePath,
            inputFileContent: inputImageFileContent,
            encoding: 'binary'
          });

          await app.processImageAssetFiles(imagesPathMap);

          const outputImageFileContent = FILE_SYSTEM_DRIVER.readFileSync(
            outputImageFilePath,
            {
              encoding: 'binary'
            }
          );
          const inputContentString = `${inputImageFileContent}`;
          const outputContentString = `${outputImageFileContent}`;

          expect(outputContentString).to.equal(inputContentString);
        }
      },
      'installDependencies': {
        'should install the right dependencies': async () => {
          const commandList = [];
          const app = new App({
            ...BASIC_APP_CONFIG,
            executeCommandLineCommand: async (command = '') => commandList.push(command)
          });

          await app.installDependencies();

          expect(commandList.length).to.be(4);
          expect(commandList[0]).to.be('cd /dir');
          expect(commandList[1]).to.be('npm init');
          expect(commandList[2]).to.be('npm i -S react-dom react-hot-loader react styled-components');
          expect(commandList[3]).to.be('npm i');
        },
        'should not run `npm init` if there is already a package.json': async () => {
          const commandList = [];
          const app = new App({
            ...BASIC_APP_CONFIG,
            executeCommandLineCommand: async (command = '') => commandList.push(command)
          });

          MemFS.writeFileSync('/dir/package.json', 'STUFF', { encoding: 'utf8' });

          await app.installDependencies();

          expect(commandList.length).to.be(3);
          expect(commandList[0]).to.be('cd /dir');
          expect(commandList[1]).to.be('npm i -S react-dom react-hot-loader react styled-components');
          expect(commandList[2]).to.be('npm i');
        }
      },
      'execute': {
        'should process all template assets and install dependencies': async () => {
          expect(true).to.be(false);
        }
      }
    }
  }
);

import expect from 'expect.js';
import Path from 'path';
import FS from 'fs';
import { createFsFromVolume, Volume } from 'memfs';
import { includeParentLevels } from '../../TestUtils';
import Command from './Command';
import { BASE_TEMPLATE_DIR } from './Constants';

let BASE_VOL,
  FSVolume,
  FILE_SYSTEM_DRIVER,
  BASIC_COMMAND_CONFIG;

const getProcessingSetup = async ({
                                    inputFilePath = '',
                                    inputFileContent,
                                    encoding = 'utf8',
                                    existingFiles = [],
                                    configOverrides = {}
                                  } = {}) => {
  const command = new Command({
    ...BASIC_COMMAND_CONFIG,
    ...configOverrides
  });
  const templateFilePathList = await command.getTemplateFilePaths();

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
    command,
    ...(await command.getTemplateFileDestinationPathMap())
  };
};
const beforeEach = () => {
  BASE_VOL = new Volume();
  FSVolume = createFsFromVolume(BASE_VOL);
  FILE_SYSTEM_DRIVER = {
    ...FSVolume,
    // Mimic fs-extra like driver.
    copy: async (fromPath = '', toPath = '') => new Promise((res, rej) => {
      FSVolume.readFile(fromPath, { encoding: 'binary' }, (error1, data) => {
        if (!!error1) {
          rej(error1);
        } else {
          FSVolume.mkdir(
            Path.dirname(toPath),
            {
              recursive: true
            },
            () => {
              FSVolume.writeFile(toPath, data, { encoding: 'binary' }, (error2) => {
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
        FSVolume.readFileSync(path, { encoding: 'binary' });
        return true;
      } catch (error) {
        return false;
      }
    }
  };
  BASIC_COMMAND_CONFIG = {
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
};

export default includeParentLevels(
  __dirname,
  {
    'Command': {
      beforeEach,
      'should configure properties on construction': () => {
        const command = new Command(BASIC_COMMAND_CONFIG);

        expect(command.fileSystemDriver).to.be(BASIC_COMMAND_CONFIG.fileSystemDriver);
        expect(command.currentWorkingDirectory).to.be(BASIC_COMMAND_CONFIG.currentWorkingDirectory);
        expect(command.title).to.be(BASIC_COMMAND_CONFIG.title);
        expect(command.description).to.be(BASIC_COMMAND_CONFIG.description);
        expect(command.themeColor).to.be(BASIC_COMMAND_CONFIG.themeColor);
        expect(command.baseDirectory).to.be(BASIC_COMMAND_CONFIG.baseDirectory);
        expect(command.includeIcons).to.be(BASIC_COMMAND_CONFIG.includeIcons);
        expect(command.isDefaultApp).to.be(BASIC_COMMAND_CONFIG.isDefaultApp);
        expect(command.overwrite).to.be(BASIC_COMMAND_CONFIG.overwrite);
      },
      'getTemplateData': {
        'should build an object with data for app asset templates': () => {
          const command = new Command({
            ...BASIC_COMMAND_CONFIG,
            isDefaultApp: false
          });
          const templateData = command.getTemplateData();

          expect(templateData.APP_NAME).to.be('My App');
          expect(templateData.APP_PATH_NAME).to.be('my-app');
          expect(templateData.APP_CLASS_NAME).to.be('MyApp');
          expect(templateData.APP_DESCRIPTION).to.be('This is an application.');
          expect(templateData.THEME_COLOR).to.be('#111111');
        },
        'should build an object with data for default app asset templates': () => {
          const command = new Command(BASIC_COMMAND_CONFIG);
          const templateData = command.getTemplateData();

          expect(templateData.APP_NAME).to.be('My App');
          expect(templateData.APP_PATH_NAME).to.be('index');
          expect(templateData.APP_CLASS_NAME).to.be('MyApp');
          expect(templateData.APP_DESCRIPTION).to.be('This is an application.');
          expect(templateData.THEME_COLOR).to.be('#111111');
        }
      },
      'getTemplateFilePaths': {
        'should list all of the paths to the default template files': async () => {
          const command = new Command(BASIC_COMMAND_CONFIG);
          const templateFilePaths = await command.getTemplateFilePaths();
          const containsIconFolderPaths = templateFilePaths
            .reduce((acc, p = '') => acc || p.indexOf('___APP_PATH_NAME___-icons') !== -1, false);

          expect(templateFilePaths).to.be.an(Array);
          expect(templateFilePaths.length).to.be.greaterThan(0);
          expect(containsIconFolderPaths).to.be(true);
        }
      },
      'getPathDestinationMap': {
        'should return a map with template file path keys and destination path values': () => {
          const command = new Command(BASIC_COMMAND_CONFIG);
          const appComponentAssetName = '___APP_CLASS_NAME___.jsx';
          const processedAppComponentAssetName = 'MyApp.jsx';
          const appComponentAssetPath = Path.join(BASE_TEMPLATE_DIR, appComponentAssetName);
          const appComponentAssetDestPath = Path.join(
            BASIC_COMMAND_CONFIG.currentWorkingDirectory,
            BASIC_COMMAND_CONFIG.baseDirectory,
            processedAppComponentAssetName
          );
          const templateFileDestinationPathMap = command.getPathDestinationMap([
            appComponentAssetPath
          ]);

          expect(templateFileDestinationPathMap).to.be.an(Object);
          expect(templateFileDestinationPathMap).to.have.key(appComponentAssetPath);
          expect(templateFileDestinationPathMap[appComponentAssetPath]).to.be(appComponentAssetDestPath);
        }
      },
      'getTemplateFileDestinationPathMap': {
        'should return a map with template file path keys and destination path values': async () => {
          const command = new Command(BASIC_COMMAND_CONFIG);
          const templateFileDestinationPathMap = await command.getTemplateFileDestinationPathMap();
          const appComponentAssetName = '___APP_CLASS_NAME___.jsx';
          const processedAppComponentAssetName = 'MyApp.jsx';
          const appComponentAssetPath = Path.join(BASE_TEMPLATE_DIR, appComponentAssetName);
          const appComponentAssetDestPath = Path.join(
            BASIC_COMMAND_CONFIG.currentWorkingDirectory,
            BASIC_COMMAND_CONFIG.baseDirectory,
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

          const command = new Command(BASIC_COMMAND_CONFIG);
          const assetFileContent = await command.readTextAssetFile(templateFilePath);

          expect(assetFileContent).to.be(templateContent);
        }
      },
      'writeTextAssetFile': {
        'should write a new text file': async () => {
          const templateFileDir = '/src';
          const templateFilePath = `${templateFileDir}/index.html`;
          const templateContent = '<html><body>TEMPLATE</body></html>';
          const command = new Command(BASIC_COMMAND_CONFIG);

          await command.writeTextAssetFile(templateFilePath, templateContent);

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
          const fromDir = '/Assets';
          const fromPath = `${fromDir}/test.jsx`;
          const toPath = '/src/test-app.jsx';
          const fileContent = `export default {
            thisIs: {
              a: 'JS file'
            }
          };`;
          const command = new Command(BASIC_COMMAND_CONFIG);

          FILE_SYSTEM_DRIVER.mkdirSync(fromDir);
          FILE_SYSTEM_DRIVER.writeFileSync(fromPath, fileContent, { encoding: 'utf8' });

          await command.copyImageAssetFile(fromPath, toPath);

          const destinationImageAssetContent = FILE_SYSTEM_DRIVER
            .readFileSync(toPath, { encoding: 'utf8' });

          expect(destinationImageAssetContent).to.be(fileContent);
        }
      },
      'checkMapForExistingDestinations': {
        'should throw an error if a destination file exists': async () => {
          const existingDestinationPath = '/dir/src/my-app.html';
          const {
            command
          } = await getProcessingSetup({
            existingFiles: [existingDestinationPath]
          });

          let existenceError;

          const checkExistence = async () => {
            try {
              await command.checkMapForExistingDestinations({
                a: existingDestinationPath
              });
            } catch (error) {
              existenceError = error;
            }
          };

          await checkExistence();

          expect(existenceError).to.be.an(Error);
          expect(existenceError.message).to.be('Destination Exists: /dir/src/my-app.html');
        },
        'should not throw an error if a destination file exists but overwrite is true': async () => {
          const existingDestinationPath = '/dir/src/my-app.html';
          const {
            command
          } = await getProcessingSetup({
            existingFiles: [existingDestinationPath],
            configOverrides: {
              overwrite: true
            }
          });

          let existenceError;

          const checkExistence = async () => {
            try {
              await command.checkMapForExistingDestinations({
                a: existingDestinationPath
              });
            } catch (error) {
              existenceError = error;
            }
          };

          await checkExistence();

          expect(existenceError).to.be(undefined);
        },
        'should not throw an error if a destination file does not exist': async () => {
          const existingDestinationPath = '/dir/src/my-app.html';
          const { command } = await getProcessingSetup({});

          let existenceError;

          const checkExistence = async () => {
            try {
              await command.checkMapForExistingDestinations({
                a: existingDestinationPath
              });
            } catch (error) {
              existenceError = error;
            }
          };

          await checkExistence();

          expect(existenceError).to.be(undefined);
        }
      },
      'processTextAssetFiles': {
        'should read, interpolate and write all text assets': async () => {
          const inputTemplateFilePath = `${BASE_TEMPLATE_DIR}/___APP_PATH_NAME___.html`;
          const inputTemplateContent = '<html><body>___APP_NAME___</body></html>';
          const outputTemplateFilePath = `/dir/src/index.html`;
          const outputTemplateContent = '<html><body>My App</body></html>';
          const {
            command,
            textPathMap = {}
          } = await getProcessingSetup({
            inputFilePath: inputTemplateFilePath,
            inputFileContent: inputTemplateContent
          });

          await command.processTextAssetFiles(textPathMap);

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
            command,
            imagesPathMap = {}
          } = await getProcessingSetup({
            inputFilePath: inputImageFilePath,
            inputFileContent: inputImageFileContent,
            encoding: 'binary',
            configOverrides: {
              isDefaultApp: false
            }
          });

          await command.processImageAssetFiles(imagesPathMap);

          const outputImageFileContent = FILE_SYSTEM_DRIVER.readFileSync(
            outputImageFilePath,
            {
              encoding: 'binary'
            }
          );
          const inputContentString = `${inputImageFileContent}`;
          const outputContentString = `${outputImageFileContent}`;

          expect(outputContentString).to.equal(inputContentString);
        },
        'should copy template image files from source to destination for a default app': async () => {
          const inputImageFilePath = `${BASE_TEMPLATE_DIR}/___APP_PATH_NAME___-icons/favicon.ico`;
          const inputImageFileContent = FS.readFileSync(inputImageFilePath, { encoding: 'binary' });
          const outputImageFilePath = `/dir/src/index-icons/favicon.ico`;
          const {
            command,
            imagesPathMap = {}
          } = await getProcessingSetup({
            inputFilePath: inputImageFilePath,
            inputFileContent: inputImageFileContent,
            encoding: 'binary'
          });

          await command.processImageAssetFiles(imagesPathMap);

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
          const cwdList = [];
          const command = new Command({
            ...BASIC_COMMAND_CONFIG,
            executeCommandLineCommand: async (command = '', cwd = '') => {
              commandList.push(command);
              cwdList.push(cwd);
            }
          });

          await command.installDependencies();

          expect(commandList.length).to.be(2);
          expect(commandList[0]).to.be('npm init -y');
          expect(commandList[1]).to.be('npm i -S react react-dom react-hot-loader styled-components');
          expect(cwdList.length).to.be(2);
          expect(cwdList[0]).to.be(BASIC_COMMAND_CONFIG.currentWorkingDirectory);
        },
        'should not run `npm init` if there is already a package.json': async () => {
          const commandList = [];
          const cwdList = [];
          const command = new Command({
            ...BASIC_COMMAND_CONFIG,
            executeCommandLineCommand: async (command = '', cwd = '') => {
              commandList.push(command);
              cwdList.push(cwd);
            }
          });

          FSVolume.mkdirSync('/dir');
          FSVolume.writeFileSync('/dir/package.json', 'STUFF', { encoding: 'utf8' });

          await command.installDependencies();

          expect(commandList.length).to.be(1);
          expect(commandList[0]).to.be('npm i -S react react-dom react-hot-loader styled-components');
          expect(cwdList.length).to.be(1);
          expect(cwdList[0]).to.be(BASIC_COMMAND_CONFIG.currentWorkingDirectory);
        }
      },
      'execute': {
        beforeEach,
        'should process all template assets and install dependencies': async () => {
          const commandList = [];
          const cwdList = [];
          const inputImageFilePath = `${BASE_TEMPLATE_DIR}/___APP_PATH_NAME___-icons/favicon.ico`;
          const inputImageFileContent = FS.readFileSync(inputImageFilePath, { encoding: 'binary' });
          const outputImageFilePath = `/dir/src/index-icons/favicon.ico`;
          const inputContentString = `${inputImageFileContent}`;
          const { command } = await getProcessingSetup({
            inputFilePath: inputImageFilePath,
            inputFileContent: inputImageFileContent,
            encoding: 'binary',
            configOverrides: {
              executeCommandLineCommand: async (command = '', cwd = '') => {
                commandList.push(command);
                cwdList.push(cwd);
              }
            }
          });

          await command.execute();

          const outputImageFileContent = FILE_SYSTEM_DRIVER.readFileSync(outputImageFilePath, { encoding: 'binary' });
          const outputContentString = `${outputImageFileContent}`;

          expect(outputContentString).to.equal(inputContentString);
          expect(commandList.length).to.be(2);
          expect(commandList[0]).to.be('npm init -y');
          expect(commandList[1]).to.be('npm i -S react react-dom react-hot-loader styled-components');
          expect(cwdList.length).to.be(2);
          expect(cwdList[0]).to.be(BASIC_COMMAND_CONFIG.currentWorkingDirectory);
        },
        'should not install dependencies when the app is not the default': async () => {
          const commandList = [];
          const cwdList = [];
          const inputImageFilePath = `${BASE_TEMPLATE_DIR}/___APP_PATH_NAME___-icons/favicon.ico`;
          const inputImageFileContent = FS.readFileSync(inputImageFilePath, { encoding: 'binary' });
          const outputImageFilePath = `/dir/src/my-app-icons/favicon.ico`;
          const inputContentString = `${inputImageFileContent}`;
          const { command } = await getProcessingSetup({
            inputFilePath: inputImageFilePath,
            inputFileContent: inputImageFileContent,
            encoding: 'binary',
            configOverrides: {
              executeCommandLineCommand: async (command = '', cwd = '') => {
                commandList.push(command);
                cwdList.push(cwd);
              },
              isDefaultApp: false
            }
          });

          await command.execute();

          const outputImageFileContent = FILE_SYSTEM_DRIVER.readFileSync(outputImageFilePath, { encoding: 'binary' });
          const outputContentString = `${outputImageFileContent}`;

          expect(outputContentString).to.equal(inputContentString);
          expect(commandList.length).to.be(0);
          expect(cwdList.length).to.be(0);
        }
      }
    }
  }
);

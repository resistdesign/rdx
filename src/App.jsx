import Path from 'path';
import Glob from 'glob';
import startCase from 'lodash.startcase';
import { BASE_TEMPLATE_DIR } from './App/Constants';
import { pathIsTemplateSource } from './App/Utils/Template';

export default class App {
  fileSystemDriver: Object;
  currentWorkingDirectory: ?string;
  /**
   * Title case, example: My App
   * */
  title: string;
  description: string;
  themeColor: ?string;
  baseDirectory: ?string;
  includeIcons: ?boolean;
  isDefaultApp: ?boolean;
  overwrite: ?boolean;

  constructor (config = {}) {
    Object.assign(this, config);
  }

  getTemplateData = () => {
    const appNameInLowerCase = `${this.title}`.toLowerCase();
    const appNameInStartCase = startCase(appNameInLowerCase);
    const appClassName = appNameInStartCase.split(' ').join('');
    const appNameInKebabCase = appNameInLowerCase.split(' ').join('-');

    return {
      APP_NAME: this.title,
      APP_PATH_NAME: appNameInKebabCase,
      APP_CLASS_NAME: appClassName,
      APP_DESCRIPTION: this.description,
      THEME_COLOR: this.themeColor
    };
  };

  getTemplateFilePaths = async () => await new Promise((res, rej) => Glob(
    Path.join(
      BASE_TEMPLATE_DIR,
      '**',
      '*'
    ),
    {},
    (error, files = []) => !!error ? rej(error) : res(files)
  ));

  getPathDestinationMap = (paths = []) => paths.reduce((acc, p = '') => ({
    ...acc,
    [p]: Path.join(
      this.baseDirectory,
      Path.relative(
        BASE_TEMPLATE_DIR,
        p
      )
    )
  }), {});

  getTemplateFileDestinationPathMap = async () => {
    const templateFilePaths = await this.getTemplateFilePaths();
    const textPaths = templateFilePaths.filter(p => pathIsTemplateSource(p));
    const imagePaths = templateFilePaths.filter(p => !pathIsTemplateSource(p));

    return {
      text: this.getPathDestinationMap(textPaths),
      images: this.getPathDestinationMap(imagePaths)
    };
  };

  readTextAssetFile = async (path = '') => await new Promise((res, rej) => {
    this.fileSystemDriver.readFile(
      path,
      {
        encoding: 'utf8'
      },
      (error, data) => {
        if (!!error) {
          rej(error);
        } else {
          res(data);
        }
      }
    );
  });

  moveImageAssetFile = async (fromPath = '', toPath = '') => await this.fileSystemDriver.copy(
    fromPath,
    toPath
  );

  processTextAssetFiles = async () => {

  };

  processImageAssetFiles = async () => {

  };

  installDependencies = () => {
    // *** Add React Related Dependencies to the Package ***
    // 1. Read the package.json file
    // -  Run `npm init` if there is no package.json
    // 2. npm install the dependencies
    // 3. npm install all
  };

  /**
   * Optional
   * */
  generateIconAssets = () => {
    // *** Optional Icon Generation ***
    // 1. Get the path to an SVG file containing an app icon
    // 2. Generate png, svg and ico files from the supplied icon
  };

  execute = () => {
    // TODO: Run all functionality.
    // TODO: Check for file existence before overwriting anything.
  };
}

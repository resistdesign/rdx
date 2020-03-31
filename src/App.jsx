import Path from 'path';
import Glob from 'glob';
import startCase from 'lodash.startcase';
import { BASE_TEMPLATE_DIR } from './App/Constants';

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

  getTemplateFilePaths = () => Glob
    .sync(
      Path.join(
        BASE_TEMPLATE_DIR,
        '**',
        '*'
      )
    );

  getTemplateFileDestinationPathMap = () => {
    const templateFilePaths = this.getTemplateFilePaths();

    return templateFilePaths
      .reduce((acc, p = '') => ({
        ...acc,
        [p]: Path.join(
          this.baseDirectory,
          Path.relative(
            BASE_TEMPLATE_DIR,
            p
          )
        )
      }), {});
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

  readTextAssets = () => {
    // *** Read text assets ***
    // 1. Get the assets main folder path
    // 2. Get a list of text asset paths
  };

  interpolateTextAssets = () => {
    // *** Interpolate text assets ***
    // 1. Build an object as the interpolation data
    // - Get the app name in various forms for insertion into text assets
    // 2. Get the right names and paths for scripts and other assets
    // 3. Merge the text and data
  };

  writeTextAssets = () => {
    // *** Write text assets ***
    // 1. Get the context folder path for output
    // 2. Get the app name in snake case for insertion into some file and folder names
    // - The icons folder name needs the app name pre-pended to it
    // 3. Build all file paths for each text asset
    // 4. Write all text assets to their paths
  };

  copyImageAssets = () => {
    // *** Read image assets ***
    // 1. Get the path in the same way there are acquired for text assets
    // *** Write image assets ***
    // 1. Get the output paths the same way as text assets
    // 2. Just copy the files from one path to another (How to copy without loading???)
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

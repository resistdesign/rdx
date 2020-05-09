import Path from 'path';
import Glob from 'glob';
import FS from 'fs-extra';
import { BASE_TEMPLATE_DIR, DEFAULT_APP_PACKAGE_DEPENDENCIES } from './Constants';
import { interpolateTemplateValues, pathIsDirectory, pathIsTemplateSource } from './Utils/Template';
import { execCommandInline } from '../Utils/CommandLine';

const upperFirst = (word = '') => word
  .split('')
  .map((c, i) => i === 0 ? c.toUpperCase() : c)
  .join('');
const DEFAULT_GLOB_SEARCH = async (pattern) => await new Promise((res, rej) => Glob(
  pattern,
  {
    nodir: true
  },
  (error, files = []) => !!error ? rej(error) : res(files)
));

export const ERROR_TYPE_CONSTANTS = {
  DESTINATION_EXISTS: 'Destination Exists'
};
export const PROJECT_FILE_CONSTANTS = {
  PACKAGE_JSON: 'package.json'
};

export type FileSystemCallback = (error: {}, data: {}) => void;

export default class Command {
  fileSystemDriver: {
    readFile: (path: string, options: {}, callback: FileSystemCallback) => string,
    mkdir: (path: string, options: {}, callback: FileSystemCallback) => any,
    writeFile: (path: string, data: any, options: {}, callback: FileSystemCallback) => any,
    copy: (fromPath: string, toPath: string) => Promise<any>,
    pathExists: (path: string) => Promise<boolean>
  };
  globFileSearch: (pattern: string) => string[];
  executeCommandLineCommand: (command: string, cwd: string) => Promise<boolean>;
  currentWorkingDirectory: string;
  /**
   * Title case, example: My App
   * */
  title: string;
  description: string;
  themeColor: string;
  baseDirectory: string;
  includeIcons: boolean;
  isDefaultApp: boolean;
  overwrite: boolean;

  constructor (config = {}) {
    Object.assign(this, config);

    if (!this.fileSystemDriver) {
      this.fileSystemDriver = FS;
    }

    if (!this.globFileSearch) {
      this.globFileSearch = DEFAULT_GLOB_SEARCH;
    }

    if (!this.executeCommandLineCommand) {
      this.executeCommandLineCommand = execCommandInline;
    }
  }

  getTemplateData = () => {
    const stringTitle = `${this.title}`;
    const appNameInLowerCase = stringTitle.toLowerCase();
    const appNameInStartCase = stringTitle
      .split(' ')
      .map(w => upperFirst(w))
      .join(' ');
    const appClassName = appNameInStartCase.split(' ').join('');
    const appNameInKebabCase = appNameInLowerCase.split(' ').join('-');
    const baseTemplateData = {
      APP_NAME: this.title,
      APP_PATH_NAME: appNameInKebabCase,
      APP_CLASS_NAME: appClassName,
      APP_DESCRIPTION: this.description,
      THEME_COLOR: this.themeColor
    };

    return {
      ...baseTemplateData,
      ICON_LINKS: this.includeIcons ? baseTemplateData : undefined
    };
  };

  getTemplateFilePaths = async () => this.globFileSearch(Path.join(
    BASE_TEMPLATE_DIR,
    '**',
    '*'
  ));

  getPathDestinationMap = (paths = []) => {
    const templateData = this.getTemplateData();

    return paths
      .filter(p => !pathIsDirectory(p))
      .reduce((acc, p = '') => ({
        ...acc,
        [p]: interpolateTemplateValues(
          Path.join(
            this.currentWorkingDirectory,
            this.baseDirectory,
            Path.relative(
              BASE_TEMPLATE_DIR,
              p
            )
          ),
          templateData
        )
      }), {});
  };

  getTemplateFileDestinationPathMap = async () => {
    const templateFilePaths = await this.getTemplateFilePaths();
    const textPaths = templateFilePaths.filter(p => pathIsTemplateSource(p));
    const imagePaths = templateFilePaths.filter(p => !pathIsTemplateSource(p));

    return {
      textPathMap: this.getPathDestinationMap(textPaths),
      imagesPathMap: this.getPathDestinationMap(imagePaths)
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

  writeTextAssetFile = async (path = '', data = '') => await new Promise((res, rej) => {
    this.fileSystemDriver.mkdir(
      Path.dirname(path),
      {
        recursive: true
      },
      () => {
        this.fileSystemDriver.writeFile(
          path,
          data,
          {
            encoding: 'utf8'
          },
          (error) => {
            if (!!error) {
              rej(error);
            } else {
              res(true);
            }
          }
        );
      }
    );
  });

  copyImageAssetFile = async (fromPath = '', toPath = '') => await this.fileSystemDriver.copy(
    fromPath,
    toPath
  );

  checkMapForExistingDestinations = async (pathMap = {}) => {
    if (!this.overwrite) {
      for (const k in pathMap) {
        if (pathMap.hasOwnProperty(k)) {
          const dest = pathMap[k];
          const exists = await this.fileSystemDriver.pathExists(dest);

          if (!!exists) {
            throw new Error(`${ERROR_TYPE_CONSTANTS.DESTINATION_EXISTS}: ${dest}`);
          }
        }
      }
    }
  };

  processTextAssetFiles = async (textPathMap = {}) => {
    const templateData = this.getTemplateData();

    return await Promise.all(
      Object
        .keys(textPathMap)
        .map(async (s) => {
          const d = textPathMap[s];
          const assetText = await this.readTextAssetFile(s);
          const processedAssetText = interpolateTemplateValues(assetText, templateData);

          await this.writeTextAssetFile(d, processedAssetText);
        })
    );
  };

  processImageAssetFiles = async (imagesPathMap = {}) => await Promise.all(
    Object
      .keys(imagesPathMap)
      .map(async (s) => {
        const d = imagesPathMap[s];

        await this.copyImageAssetFile(s, d);
      })
  );

  installDependencies = async () => {
    const depList = DEFAULT_APP_PACKAGE_DEPENDENCIES.join(' ');
    const packageExists = await this.fileSystemDriver.pathExists(
      Path.join(
        this.currentWorkingDirectory,
        PROJECT_FILE_CONSTANTS.PACKAGE_JSON
      )
    );

    if (!packageExists) {
      // Only run `npm init` when there is no `package.json`.
      await this.executeCommandLineCommand(
        'npm init -y',
        this.currentWorkingDirectory
      );
    }

    await this.executeCommandLineCommand(
      `npm i -S ${depList}`,
      this.currentWorkingDirectory
    );
  };

  execute = async () => {
    const {
      textPathMap = {},
      imagesPathMap = {}
    } = await this.getTemplateFileDestinationPathMap();

    // Check for file existence before overwriting anything.
    await this.checkMapForExistingDestinations(textPathMap);
    await this.checkMapForExistingDestinations(imagesPathMap);

    await this.processTextAssetFiles(textPathMap);

    if (!!this.includeIcons) {
      await this.processImageAssetFiles(imagesPathMap);
    }

    if (!!this.isDefaultApp) {
      await this.installDependencies();
    }
  };
}

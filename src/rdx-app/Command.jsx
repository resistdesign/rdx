import Path from 'path';
import {
  BASE_TEMPLATE_DIR,
  DEFAULT_APP_PACKAGE_DEPENDENCIES,
  DEFAULT_APP_PACKAGE_DEV_DEPENDENCIES,
  DEFAULT_APP_PACKAGE_SCRIPTS
} from './Constants';
import {CWD} from '../Utils/Path';
import File, {globSearch} from '../Utils/File';
import Package from '../Utils/Package';
import {execCommandInline} from '../Utils/CommandLine';
import {interpolateTemplateValues, pathIsDirectory, pathIsTemplateSource} from './Utils/Template';

const upperFirst = (word = '') => word
  .split('')
  .map((c, i) => i === 0 ? c.toUpperCase() : c)
  .join('');

export const ERROR_TYPE_CONSTANTS = {
  DESTINATION_EXISTS: 'Destination Exists'
};

export type FileAPI = {
  pathExists: typeof File.prototype.pathExists,
  ensureDirectory: typeof File.prototype.ensureDirectory,
  readFile: typeof File.prototype.readFile,
  writeFile: typeof File.prototype.writeFile,
  copyFile: typeof File.prototype.copyFile
};

export default class Command {
  currentWorkingDirectory: string;
  globFileSearch: (pattern: string) => string[];
  fileAPI: FileAPI;
  packageAPI: Package;
  executeCommandLineCommand: (command: string, cwd: string) => Promise<boolean>;
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

  constructor(config = {}) {
    Object.assign(this, config);

    this.currentWorkingDirectory = this.currentWorkingDirectory || CWD;
    this.globFileSearch = this.globFileSearch || globSearch;
    this.fileAPI = this.fileAPI || new File({
      cwd: this.currentWorkingDirectory
    });
    this.packageAPI = this.packageAPI || new Package({
      cwd: this.currentWorkingDirectory,
      fileAPI: this.fileAPI
    });
    this.executeCommandLineCommand = this.executeCommandLineCommand || execCommandInline;
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
      APP_PATH_NAME: !!this.isDefaultApp ? 'index' : appNameInKebabCase,
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

  checkMapForExistingDestinations = async (pathMap = {}) => {
    if (!this.overwrite) {
      for (const k in pathMap) {
        if (pathMap.hasOwnProperty(k)) {
          const dest = pathMap[k];
          const exists = await this.fileAPI.pathExists(dest);

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
          const assetText = await this.fileAPI.readFile({path: s});
          const processedAssetText = interpolateTemplateValues(assetText, templateData);

          await this.fileAPI.writeFile({
            path: d,
            data: processedAssetText
          });
        })
    );
  };

  processImageAssetFiles = async (imagesPathMap = {}) => await Promise.all(
    Object
      .keys(imagesPathMap)
      .map(async (s) => {
        const d = imagesPathMap[s];

        await this.fileAPI.copyFile({
          fromPath: s,
          toPath: d,
          binary: true
        });
      })
  );

  installDependencies = async () => {
    const depList = DEFAULT_APP_PACKAGE_DEPENDENCIES.join(' ');
    const devDepList = DEFAULT_APP_PACKAGE_DEV_DEPENDENCIES.join(' ');
    const packageExists = await this.packageAPI.packageExists();

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
    await this.executeCommandLineCommand(
      `npm i -D ${devDepList}`,
      this.currentWorkingDirectory
    );
  };

  installScripts = async () => {
    const {
      APP_PATH_NAME
    } = this.getTemplateData();
    const packageJsonObject = await this.packageAPI.getPackageObject();
    const {
      scripts
    } = packageJsonObject;
    const defaultScripts = Object
      .keys(DEFAULT_APP_PACKAGE_SCRIPTS)
      .reduce((acc, k) => ({
        ...acc,
        [`${k}:${APP_PATH_NAME}`]: `${DEFAULT_APP_PACKAGE_SCRIPTS[k]} -a ${Path.join(
          '.',
          this.baseDirectory,
          `${APP_PATH_NAME}-entry.jsx`
        )}`
      }), {});
    const packageObject = {
      ...packageJsonObject,
      scripts: {
        ...scripts,
        ...defaultScripts
      }
    };

    await this.packageAPI.setPackageObject({packageObject});
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

    await this.installScripts();
  };
}

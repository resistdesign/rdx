import 'colors';
import FS from 'fs-extra';
import Path from 'path';
import Command from '../Base/Command';
import Prompt from 'prompt';
import Mustache from 'mustache';

const PROMPT_FIELDS = [
  {
    name: 'a',
    type: 'string',
    description: `App name. Example: ${'RDX App'.yellow}`,
    pattern: /^[A-Za-z][A-Za-z0-9 ]*$/m,
    message: `Use letters, numbers and spaces but don't start with a number or space.`,
    default: 'App',
    required: true
  },
  {
    name: 'f',
    type: 'string',
    description: `Folder path. Example: ${'src/some-path'.yellow}`,
    pattern: /^(?!\.\.)[A-Za-z.][A-Za-z0-9 /.\-_\\]*$/m,
    message: `Use a typical directory path that is NOT outside of the current directory.`,
    default: 'src',
    required: true
  },
  {
    name: 'd',
    type: 'string',
    description: 'Is this the default app?',
    pattern: /^(Yes|No|yes|no|Y|N|y|n)$/m,
    message: 'Options: Yes, yes, Y, y, No, no, N or n',
    default: 'No',
    required: true,
    before: value => value.toLowerCase().substr(0, 1) === 'y'
  },
  {
    name: 'i',
    type: 'string',
    description: 'Should icons be included?',
    pattern: /^(Yes|No|yes|no|Y|N|y|n)$/m,
    message: 'Options: Yes, yes, Y, y, No, no, N or n',
    default: 'Yes',
    required: true,
    before: value => value.toLowerCase().substr(0, 1) === 'y'
  },
  {
    name: 'c',
    type: 'string',
    description: 'Theme color.',
    pattern: /^#?[a-f0-9]*$/m,
    message: 'Must be a hexadecimal color.',
    default: '#ffffff',
    required: true,
    before: value => value.substr(0, 1) === '#' ? value : `#${value}`
  }
];
const HELP_DESCRIPTOR = {
  '*': 'Omit any flag to be prompted for a value.',
  ...PROMPT_FIELDS.reduce((pV, cV, cI, a) => {
    const msg = cV.message ? `\n\t${cV.message}` : '';
    const def = cV.hasOwnProperty('default') ? `\n\tDefault: ${JSON.stringify(cV.default)}` : '';
    pV[`-${cV.name}`] = `${cV.description}${msg}${def}`;

    return pV;
  }, {})
};

// Directories
const ASSET_DIR = Path.resolve(Path.join(__dirname, '..', 'Assets', 'App'));
const ICONS_DIR_NAME = 'icons';
const ICON_DIR_PATH = Path.resolve(Path.join(ASSET_DIR, ICONS_DIR_NAME));

// File Names
const APP_HTML = 'app.html';
const APP_JS = 'App.js';
const APP_LESS = 'app.less';
const ENTRY_JS = 'entry.js';
const ICONS_HTML = 'icons.html';
const PACKAGE_JSON = 'package.json';
const README_MD = 'README.md';
const BROWSER_CONFIG_XML = 'browserconfig.xml';
const MANIFEST_JSON = 'manifest.json';

export default class App extends Command {
  constructor() {
    super('app', HELP_DESCRIPTOR);
  }

  async getAppInfo(args) {
    const info = await new Promise((res, rej) => {
      Prompt.colors = false;
      Prompt.message = '';
      Prompt.delimiter = '';
      Prompt.override = args;
      Prompt.start();
      Prompt.get(PROMPT_FIELDS, (error, result) => {
        if (error) {
          res(undefined);
          return;
        }

        res(result);
      })
    });

    if (typeof info.d === 'string') {
      info.d = info.d.toLowerCase().substr(0, 1) === 'y';
    }

    if (typeof info.i === 'string') {
      info.i = info.i.toLowerCase().substr(0, 1) === 'y';
    }

    if (typeof info.c === 'string') {
      info.c = info.c.substr(0, 1) === '#' ? info.c : `#${info.c}`;
    }

    return info;
  }

  async mkDir(dir) {
    return await new Promise((res, rej) => {
      FS.mkdirs(dir, error => {
        if (error) {
          rej(error);
          return;
        }

        res(true);
      });
    });
  }

  async copy(from, to) {
    return await new Promise((res, rej) => {
      FS.copy(
        from,
        to,
        { clobber: false },
        (error, result) => {
          if (error) {
            rej(error);
            return;
          }

          res(result);
        }
      );
    });
  }

  async readFile(path) {
    return await new Promise((res, rej) => {
      FS.readFile(
        path,
        { encoding: 'utf8' },
        (error, result) => {
          if (error) {
            rej(error);
            return;
          }

          res(result);
        }
      );
    });
  }

  async readAsset(name) {
    return await this.readFile(
      Path.resolve(Path.join(ASSET_DIR, name))
    );
  }

  async writeAsset(name, dir, content, overwrite = true) {
    await this.mkDir(dir);
    const fullPath = Path.join(dir, name);

    if (!overwrite) {
      const fileExists = await new Promise(res => {
        FS.lstat(
          fullPath,
          error => {
            if (error) {
              res(false);
              return;
            }

            res(true);
          }
        );
      });

      if (fileExists) {
        return false;
      }
    }

    return await new Promise((res, rej) => {
      FS.writeFile(
        fullPath,
        content,
        { encoding: 'utf8' },
        (error, result) => {
          if (error) {
            rej(error);
            return;
          }

          res(result);
        }
      );
    });
  }

  async getParsedTemplate(name, templateInfo) {
    const content = await this.readAsset(name);

    return Mustache.render(content, templateInfo);
  }

  getTemplateInfo(appInfo) {
    return {
      title: appInfo.a,
      path: appInfo.f,
      name: appInfo.a.replace(/ /g, ''),
      smallName: appInfo.d ? 'index' : appInfo.a.toLowerCase().replace(/ /g, '-'),
      themeColor: appInfo.c
    };
  }

  async run(args) {
    await super.run(args);
    const appInfo = await this.getAppInfo(args);

    if (!appInfo) {
      return 'Command Cancelled.';
    }

    const templateInfo = this.getTemplateInfo(appInfo);
    const iconHTML = appInfo.i ? await this.getParsedTemplate(ICONS_HTML, templateInfo) : '';
    const templateInfoWithIcons = {
      ...templateInfo,
      icons: iconHTML
    };
    // Content
    const appHTML = await this.getParsedTemplate(APP_HTML, templateInfoWithIcons);
    const appJS = await this.getParsedTemplate(APP_JS, templateInfoWithIcons);
    const appLESS = await this.getParsedTemplate(APP_LESS, templateInfoWithIcons);
    const entryJS = await this.getParsedTemplate(ENTRY_JS, templateInfoWithIcons);
    // Destination
    const cwd = process.cwd();
    const destDir = Path.join(cwd, appInfo.f);

    // Write Assets
    this.log('Start', 'Writing Assets...', 'Basic');
    await this.writeAsset(`${templateInfo.smallName}.html`, destDir, appHTML);
    await this.writeAsset(`${templateInfo.name}.js`, destDir, appJS);
    await this.writeAsset(`${templateInfo.smallName}.less`, destDir, appLESS);
    await this.writeAsset(`${templateInfo.smallName}-entry.js`, destDir, entryJS);
    this.log('Finished', 'Writing Assets', 'Basic');

    // The app is the default app.
    if (appInfo.d) {
      const readmeMD = await this.getParsedTemplate(README_MD, templateInfoWithIcons);
      const depPackInfo = await this.getParsedTemplate(PACKAGE_JSON, templateInfoWithIcons);
      const depPackObj = JSON.parse(depPackInfo);
      const projPackRoot = Command.findRoot();
      const projPackInfo = await this.readFile(Path.resolve(Path.join(projPackRoot, PACKAGE_JSON)));
      const projPackObj = JSON.parse(projPackInfo);
      const newProjPackObj = {
        ...projPackObj,
        devDependencies: {
          ...projPackObj.devDependencies,
          ...depPackObj.devDependencies
        }
      };
      const newProjPackInfo = JSON.stringify(newProjPackObj, null, '  ');

      this.log('Start', 'Writing Assets...', 'Project');
      this.log('Added', 'Development Dependencies', Object.keys(depPackObj.devDependencies).join(', '));
      await this.writeAsset(PACKAGE_JSON, projPackRoot, newProjPackInfo);
      await this.writeAsset(README_MD, projPackRoot, readmeMD, false);
      this.log('Finished', 'Writing Assets', 'Project');
    }

    if (appInfo.i) {
      this.log('Start', 'Writing Assets...', 'Icons');
      const destIconsDir = Path.join(
        destDir,
        `${templateInfo.smallName}-icons`
      );
      const browserConfigXML = await this.getParsedTemplate(
        Path.join(ICONS_DIR_NAME, BROWSER_CONFIG_XML),
        templateInfoWithIcons
      );
      const manifestJSON = await this.getParsedTemplate(
        Path.join(ICONS_DIR_NAME, MANIFEST_JSON),
        templateInfoWithIcons
      );

      await this.copy(
        ICON_DIR_PATH,
        destIconsDir
      );

      await this.writeAsset(
        BROWSER_CONFIG_XML,
        destIconsDir,
        browserConfigXML
      );
      await this.writeAsset(
        MANIFEST_JSON,
        destIconsDir,
        manifestJSON
      );
      this.log('Finished', 'Writing Assets', 'Icons');
    }
  }
}

import 'colors';
import Path from 'path';
import Command from '../Base/Command';
import Prompt from 'prompt';

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
    pattern: /^(Yes|No|Y|N|y|n)$/m,
    message: 'Options: Yes, Y, y, No, N or n',
    default: 'No',
    required: true,
    before: value => value.toLowerCase().substr(0, 1) === 'y'
  },
  {
    name: 'i',
    type: 'string',
    description: 'Should icons be included?',
    pattern: /^(Yes|No|Y|N|y|n)$/m,
    message: 'Options: Yes, Y, y, No, N or n',
    default: 'Yes',
    required: true,
    before: value => value.toLowerCase().substr(0, 1) === 'y'
  }
];
const HELP_DESCRIPTOR = PROMPT_FIELDS.reduce((pV, cV, cI, a) => {
  const msg = cV.message ? `\n\t${cV.message}` : '';
  const def = cV.hasOwnProperty('default') ? `\n\tDefault: ${JSON.stringify(cV.default)}` : '';
  pV[`-${cV.name}`] = `${cV.description}${msg}${def}`;

  return pV;
}, {});

export default class App extends Command {
  constructor() {
    super('app', HELP_DESCRIPTOR);
  }

  async getAppInfo(args) {
    return await new Promise((res, rej) => {
      Prompt.colors = false;
      Prompt.message = '';
      Prompt.delimiter = '';
      Prompt.override = args;
      Prompt.start();
      Prompt.get(PROMPT_FIELDS, (error, result) => {
        if (error) {
          rej(new Error('Command Cancelled.'));
          return;
        }

        res(result);
      })
    });
  }

  async run(args) {
    await super.run(args);
    const appInfo = await this.getAppInfo(args);

    // TODO: ...
    // get app name
    // get folder
    // find out if this will be the default app
    // find out if they want icons
    // - add icons.html to app.html
    // - deploy icons
    // make app name, convert App Name to AppName
    // make small app name, convert App Name to app-name (index if default)
    // if default do default setup
    // - deploy README.md
    // - deploy React devDependencies in package.json
    // deploy app.html
    // deploy entry.js
    // deploy App.js
    // deploy app.less

  }
}

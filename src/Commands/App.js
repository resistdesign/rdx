import Command from '../Base/Command';

export default class App extends Command {
  constructor() {
    super('app');
  }

  async run(args) {
    await super.run(args);

    // TODO: ...
    // get app name
    // get folder
    // find out if they want icons
    // - add icons.html to app.html
    // - deploy icons
    // find out if this will be the default app
    // make small app name (index if default)
    // if default do default setup
    // - deploy README.md
    // - deploy React devDependencies in package.json
    // deploy app.html
    // deploy entry.js
    // deploy App.js
    // deploy app.less

  }
}

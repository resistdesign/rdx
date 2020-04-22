#!/usr/bin/env node

const Program = require('commander');
const App = require('./App');

/**
 * The App program.
 * @type {Object}
 * */
Program
  .option('-t, --title', 'The application title. Example: My App', 'App')
  .option('-p, --description', 'The application description.', '')
  .option('-r, --theme-color', 'The theme color.', '#ffffff')
  .option('-b, --base <directory>', 'The base directory for app files.', 'src')
  .option('-i, --icons', 'Include app icons and metadata.', true)
  .option('-d, --default', 'Is the application the default application?', false)
  .option('-o, --overwrite', 'Overwrite existing files.', false)
  .parse(process.argv);

const {
  title,
  description,
  themeColor,
  base: baseDirectory,
  icons: includeIcons,
  default: isDefaultApp,
  overwrite
} = Program;
const exec = async () => {
  const app = new App({
    currentWorkingDirectory: process.cwd(),
    title,
    description,
    themeColor,
    baseDirectory,
    includeIcons,
    isDefaultApp,
    overwrite
  });

  await app.execute();
};

exec()
  .then(() => {
    process.exit();
  });

#!/usr/bin/env node

const Program = require('commander');

/**
 * The App program.
 * @type {Object}
 * */
Program
  .option('-i, --icons', 'Include app icons and metadata.', true)
  .option('-b, --base <directory>', 'The base directory for app files.', 'src')
  .parse(process.argv);

// currentWorkingDirectory: string;
// title: string;
// description: string;
// themeColor: string;
// baseDirectory: string;
// includeIcons: boolean;
// isDefaultApp: boolean;
// overwrite: boolean;

const exec = async () => {

};

exec()
  .then(() => {
    process.exit();
  });

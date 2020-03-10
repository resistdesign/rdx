#!/usr/bin/env node

const program = require('commander');

/**
 * The App program.
 * @type {Object}
 * */
program
  .option('-i, --icons', 'Include app icons and metadata.')
  .option('-b, --base <directory>', 'The base directory for app files.', 'src')
  .parse(process.argv);

#!/usr/bin/env node

require('@resistdesign/jsx-compiler/src/Utils/Env');
const program = require('commander');
const {
  version,
  description
} = require('../package');

/**
 * The main CLI program.
 * @type {Object}
 * */
program
  .version(version, '-v, --version')
  .description(description)
  .command(
    'compile [input] [output]',
    'Compile the input file or pattern to the output directory.',
    { isDefault: true }
  ).alias('c')
  .command(
    // TODO: Make file name and path more obvious and user friendly.
    'app [name] [file-name-and-path-relative-to-base]',
    'Create the files needed to build an app.'
  )
  .alias('a')
  .command(
    'serve [input]',
    'Serve and live compile the input file or pattern.'
  )
  .alias('s')
  .parse(process.argv);

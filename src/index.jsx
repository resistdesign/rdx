#!/usr/bin/env node

import program from 'commander';
import {description, version} from '../package';

const EXECUTABLE_EXTENSION = process.env.EXECUTABLE_EXTENSION || 'js';

program
  .version(version, '-v, --version')
  .description(description)
  .command(
    'compile [input] [output]',
    'Compile the input file or pattern to the output directory.',
    {
      isDefault: true,
      executableFile: `rdx-compile.${EXECUTABLE_EXTENSION}`
    }
  ).alias('c')
  .command(
    'app',
    'Create the files needed to build an app.',
    {executableFile: `rdx-app.${EXECUTABLE_EXTENSION}`}
  )
  .alias('a')
  .command(
    'serve [input]',
    'Serve and live compile the input file or pattern.',
    {executableFile: `rdx-serve.${EXECUTABLE_EXTENSION}`}
  )
  .alias('s')
  .parse(process.argv);

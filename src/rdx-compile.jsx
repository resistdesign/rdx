#!/usr/bin/env node

import Glob from 'glob';
import Program from 'commander';
import WebPack from 'webpack';
import {DEFAULT_RUNTIME, RUNTIME_LIST} from './rdx-compile/Constants';
import {getConfig} from './rdx-compile/Utils';
import {getFullTargetPath} from './Utils/Path';
import {getMergedCommandOptions} from './Utils/Package';

Program
  .option('-r, --runtime <option>', `The runtime to target. Options: ${RUNTIME_LIST.join(', ')}. Default: ${DEFAULT_RUNTIME}.`)
  .option('-b, --base <directory>', 'The base directory for JSX files. Default: src.')
  .option('-l, --library', 'Process files as library files that do NOT contain each other.')
  .parse(process.argv);

const run = async () => {
  const mergedOptions = await getMergedCommandOptions({
    command: 'compile',
    suppliedOptions: Program.opts()
  });
  const {
    base = 'src'
  } = mergedOptions;
  const {
    args: [
      input = `${base}/**/*.jsx`,
      output = 'dist'
    ] = [],
    runtime = DEFAULT_RUNTIME,
    library = false
  } = mergedOptions;
  const inputPaths = Glob.sync(input) || [];
  const webPackConfig = getConfig({
    inputPaths: inputPaths
      .map(p => getFullTargetPath(p)),
    outputPath: getFullTargetPath(output),
    runtime,
    base,
    library
  });
  const startInMS = new Date().getTime();

  console.log();
  console.log(`Compiling (${runtime})...`);
  console.log();

  WebPack(
    webPackConfig,
    (err, stats) => {
      if (err || stats.hasErrors()) {
        console.log('Compile FAILED:');
        console.log();
        console.log(err);
        console.log();
        console.log(!!stats && stats.toJson('minimal').errors);
        console.log();
      } else {
        const endInMS = new Date().getTime();
        const durationInSeconds = (endInMS - startInMS) / 1000;

        console.log(`Finished compiling in ${durationInSeconds} seconds.`);
        console.log();
      }
      console.log(

      );
    }
  );
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch(e => {
    console.log('There was an error:', e);
    process.exit(1);
  });

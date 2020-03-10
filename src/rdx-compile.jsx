#!/usr/bin/env node

const Glob = require('glob');
const {
  RUNTIMES,
  DEFAULT_RUNTIME,
  getConfig
} = require('./Utils/Compile');
const { getFullTargetPath } = require('./Utils/Path');
const program = require('commander');
const WebPack = require('webpack');
const {
  getMergedOptions
} = require('./Utils/Package');

const RUNTIME_LIST = Object
  .keys(RUNTIMES)
  .map(k => RUNTIMES[k]);

/**
 * The Compile program.
 * @type {Object}
 * */
program
  .option('-r, --runtime <option>', `The runtime to target. Options: ${RUNTIME_LIST.join(', ')}. Default: ${DEFAULT_RUNTIME}.`)
  .option('-b, --base <directory>', 'The base directory for JSX files. Default: src.')
  .option('-l, --library', 'Process files as library files that do NOT contain each other.')
  .parse(process.argv);

const mergedOptions = getMergedOptions('compile', program);
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

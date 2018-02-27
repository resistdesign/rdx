import Path from 'path';
import WebPack from 'webpack';
import Glob from 'glob';
import Command from '../Base/Command';
import WebPackConfigBuilder from '../Config/WebPack/WebPackConfigBuilder';
import BabelOptions from '../Config/WebPack/Constants/BabelOptions';

export default class Compile extends Command {
  static DEFAULT_ENV = 'production';

  static GENERIC_COMPILE_ERROR_MESSAGE = 'There were errors during compilation.';

  static DEFAULT_CONTEXT_PATH = './src';
  static DEFAULT_OUTPUT_PATH = './public';

  static HELP_DESCRIPTOR = {
    'Environment Variables': `NODE_ENV: The current process environment value.
\tDEBUG: Used by a specific application for debug purposes.`,
    '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ${'rdx compile -a src/index.html'.yellow}`,
    '-c': 'Context path. Default: ./src',
    '-o': 'Output path. Default: ./public',
    '-t': 'Set the compile target.',
    '--babelrc': 'Enable the use of per package .babelrc files.'
  };

  constructor() {
    super('compile', Compile.HELP_DESCRIPTOR);
  }

  static setENV(ENV) {
    try {
      if (typeof process.env.NODE_ENV !== 'string') {
        process.env.NODE_ENV = ENV;
      }
    } catch (error) {
      // Ignore.
    }
  }

  static processArgs(args) {
    const contextPath = typeof args.c === 'string' ? args.c : Compile.DEFAULT_CONTEXT_PATH;

    // TRICKY: Enable the use of per package `.babelrc` files.
    if (args.babelrc) {
      BabelOptions.babelrc = true;
    }

    return {
      targets: typeof args.a !== 'string' || args.a === '' ?
        (Glob.sync(Path.join(contextPath, '**/*.html')) || []) :
        [args.a],
      contextPath,
      outputPath: Path.resolve(
        typeof args.o === 'string' ? args.o : Compile.DEFAULT_OUTPUT_PATH
      ),
      compileTarget: args.t
    };
  }

  static onCompileComplete(error, stats) {
    if (error) {
      Command.logError(error);
      return;
    }

    const jsonStats = stats.toJson();
    if (jsonStats.errors.length > 0) {
      jsonStats.errors.forEach(error => {
        Command.logError(error);
      });
      return;
    }

    if (jsonStats.warnings.length > 0) {
      jsonStats.warnings.forEach(warning => {
        const lines = warning ? String(warning).split('\n') : [''];

        Command.logError(`\t\t${lines.join('\n\t\t')}`, true);
      });
    }
  }

  static getCompiler({targets, contextPath, outputPath, compileTarget},
                     serve = false,
                     inlineContent = '',
                     host,
                     port,
                     protocol) {
    const webPackConfig = [];

    if (!(targets instanceof Array) || !targets.length) {
      throw new Error('No application(s) specified.');
    }

    targets.forEach(path => {
      const config = WebPackConfigBuilder
        .getConfig(
          path,
          contextPath,
          outputPath,
          serve,
          inlineContent,
          host,
          port,
          compileTarget,
          protocol
        );

      webPackConfig.push(config);
    });

    return WebPack(webPackConfig, Compile.onCompileComplete);
  }

  async run(args) {
    await this.runBase(args);
    Compile.setENV(Compile.DEFAULT_ENV);
    const argConfig = Compile.processArgs(args);
    const compiler = Compile.getCompiler(argConfig);

    this.log('Start', 'Compiling:', `${argConfig.targets.join(', ')}`);

    await new Promise((res, rej) => {
      compiler.run((error, stats) => {
        const jsonStats = stats && stats.toJson();

        this.log('Finished', 'Compiling:', `${argConfig.targets.join(', ')}`);

        if (error) {
          rej(new Error(Compile.GENERIC_COMPILE_ERROR_MESSAGE));
          return;
        }

        if (jsonStats.errors.length > 0) {
          rej(new Error(Compile.GENERIC_COMPILE_ERROR_MESSAGE));
          return;
        }

        res();
      });
    });
  }
}

import Path from 'path';
import Command from '../Base/Command';
import WebPack from 'webpack';
import Glob from 'glob';
import WebPackConfigBuilder from '../Config/WebPack/WebPackConfigBuilder';

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
\tExample: ` + ('rdx compile -a src/index.html'.yellow),
    '-c': 'Context path. Default: ./src',
    '-o': 'Output path. Default: ./public'
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

    return {
      targets: typeof args.a !== 'string' || args.a === '' ?
        (Glob.sync(Path.join(contextPath, '**/*.html')) || []) :
        [args.a],
      contextPath,
      outputPath: Path.resolve(
        typeof args.o === 'string' ? args.o : Compile.DEFAULT_OUTPUT_PATH
      )
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
        let lines = warning ? String(warning).split('\n') : [''];

        Command.logError(`\t\t${lines.join('\n\t\t')}`, true);
      });
    }
  }

  static getCompiler({ targets, contextPath, outputPath }, serve = false, inlineContent = '', host, port) {
    const webPackConfig = [];

    if (!targets instanceof Array || !targets.length) {
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
          port
        );

      webPackConfig.push(config);
    });

    return WebPack(webPackConfig, Compile.onCompileComplete);
  }

  async run(args) {
    await super.run(args);
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

import Path from 'path';
import Command from '../Base/Command';
import WebPack from 'webpack';
import Glob from 'glob';
import WebPackConfigBuilder from '../Config/WebPack/WebPackConfigBuilder';

export default class Compile extends Command {
  static DEFAULT_CONTEXT_PATH = './src';
  static DEFAULT_OUTPUT_PATH = './public';

  static HELP_DESCRIPTOR = {
    '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a src/index.html'.yellow),
    '-c': 'Context path. Default: ./src',
    '-o': 'Output path. Default: ./public'
  };

  constructor() {
    super('compile', Compile.HELP_DESCRIPTOR);
  }

  static processArgs(args) {
    return {
      targets: typeof args.a !== 'string' || args.a === '' ?
        (Glob.sync(`${Compile.DEFAULT_CONTEXT_PATH}/**/*.html`) || []) :
        [args.a],
      contextPath: typeof args.c === 'string' ? args.c : Compile.DEFAULT_CONTEXT_PATH,
      outputPath: Path.resolve(
        typeof args.o === 'string' ? args.o : Compile.DEFAULT_OUTPUT_PATH
      )
    };
  }

  static getCompiler({ targets, contextPath, outputPath }, serve = false) {
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
          serve
        );

      webPackConfig.push(config);
    });

    return WebPack(webPackConfig);
  }

  async run(args) {
    await super.run(args);
    const argConfig = Compile.processArgs(args);
    const compiler = Compile.getCompiler(argConfig);

    this.log('Start', 'Compiling:', `${argConfig.targets.join(', ')}`);

    await new Promise((res, rej) => {
      compiler.run((error, stats) => {
        if (error) {
          rej(error);
          return;
        }

        this.log('Finished', 'Compiled:', `${argConfig.targets.join(', ')}`);

        const jsonStats = stats.toJson();
        if (jsonStats.errors.length > 0) {
          rej(jsonStats.errors.join('\n\n'));
          return;
        }

        if (jsonStats.warnings.length > 0) {
          const formattedWarnings = jsonStats.warnings.map(function (warning) {
            let lines = warning ? String(warning).split('\n') : [''];

            return '\t\t' + lines.join('\n\t\t');
          }).join('\n\n').yellow;
          this.log('Warnings:', formattedWarnings);
        }

        res();
      });
    });
  }
}

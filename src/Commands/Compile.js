import Command from '../Base/Command';
import Config from '../Config/WebPack/Compile';
import WebPack from 'webpack';

export default class Compile extends Command {
  constructor() {
    super('compile', {
      '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a src/index.js'.yellow)
    });
  }

  async run(args) {
    const target = typeof args.a === 'string' ? args.a : './src/index.js';

    await super.run(args);

    const webPackConfig = Config({
      index: target
    });
    const compiler = WebPack(webPackConfig);

    this.log('Start', 'Running the compiler on:', `${target}`);

    await new Promise((res, rej) => {
      compiler.run((error, stats) => {
        if (error) {
          rej(error);
          return;
        }

        this.log('Finished', 'Compiled:', `${target}`);

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

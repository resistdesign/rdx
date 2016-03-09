import Command from '../Base/Command';
import Config from '../Config/WebPack/Compile';
import WebPack from 'webpack';

export default class Compile extends Command {
  static ALL_APPLICATIONS = '*** All Applications ***';

  constructor() {
    super('compile', {
      '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a index'.yellow)
    });
  }

  async run(args) {
    const target = args.all || typeof args.a !== 'string' ? [] : args.a;
    const targetName = target instanceof Array ? Compile.ALL_APPLICATIONS : target;
    // TODO
    const compiler = WebPack(Config);
    await super.run(args);

    this.log('Start', 'Running the compiler on:', `${targetName}`);

    await new Promise((res, rej) => {
      compiler.run((error, stats) => {
        this.log('Finished', 'Compiled:', `${targetName}`);

        if (error) {
          rej(error.message);
          return;
        }

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

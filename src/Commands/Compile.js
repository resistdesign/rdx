import Command from '../Base/Command';
import Config from '../Config/WebPack/Compile';
import WebPack from 'webpack';
import Glob from 'glob';
import Path from 'path';
import HTMLEntrypoint from '../Config/WebPack/Utils/HTMLEntrypoint';
import FS from 'fs';

export default class Compile extends Command {
  constructor() {
    super('compile', {
      '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a src/index.html'.yellow)
    });
  }

  async run(args) {
    const contextPath = './src';
    const outputPath = './public';
    const target = typeof args.a === 'string' ?
      [args.a] : Glob.sync('./src/**/*.html') || [];

    await super.run(args);

    if (!target instanceof Array || !target.length) {
      throw new Error('No application(s) specified.');
    }

    const webPackConfig = [];

    target.forEach(path => {
      // const pathRelativeToSrc = Path.relative(contextPath, path);
      // TODO: Paths extracted from HTML are relative to the HTML file.
      // TODO: They must be made relative to the CWD and then to `src`.
      const htmlEntry = new HTMLEntrypoint(FS.readFileSync(path, { encoding: 'utf8' }));
      const config = Config(
        htmlEntry.getEntrypoints(),
        contextPath,
        outputPath
      );

      config.context = Path.dirname(path);
      webPackConfig.push(config);
      console.log('HTML Entry toHTML:', htmlEntry.toHTML());

      // entryMap[pathRelativeToSrc] = path;
    });

    const compiler = WebPack(webPackConfig);

    this.log('Start', 'Compiling:', `${target.join(', ')}`);

    await new Promise((res, rej) => {
      compiler.run((error, stats) => {
        if (error) {
          rej(error);
          return;
        }

        this.log('Finished', 'Compiled:', `${target.join(', ')}`);

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

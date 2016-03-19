import Command from '../Base/Command';
import Package from '../../package.json';

export default class Default extends Command {
  constructor() {
    super('', {
      '-h': 'Usage/Help (All Commands).',
      '-v': `Show the current version.
\tCurrently ` + `v${Package.version}.`.yellow
    });
  }

  async run(args) {
    await super.run(args, true);

    if (args.v) {
      this.log('Version', Package.version);
    } else {
      this.log('');
      await super.run({ h: true }, true);
    }
  }
}

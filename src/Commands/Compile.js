import Command from '../Base/Command';

export default class Compile extends Command {
  static ALL_APPLICATIONS = '*** All Applications ***';

  constructor() {
    super('compile', {
      '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a index.html'.yellow)
    });
  }

  async run(args) {
    const target = args.all || typeof args.a !== 'string' ? [] : args.a;
    const targetName = target instanceof Array ? Compile.ALL_APPLICATIONS : target;
    await super.run(args);

    this.log('Start', 'Running the compiler on:', `${targetName}`);
  }
}
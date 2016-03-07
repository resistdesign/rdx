import Command from '../Base/Command';

export default class Compile extends Command {
  constructor() {
    super('compile', {
      '-a': `Compile a specific application.
\tOmit to compile all applications.
\tExample: ` + ('rdx compile -a index.html'.yellow)
    });
  }

  async run(args) {
    const target = args.all ? [] : args.a;
    await super.run(args);

    this.log('Start', 'Running the compiler on',);
  }
}
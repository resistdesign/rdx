import 'colors';

export default class Command {
  static APP_NAME = 'RDX';

  title = 'command';

  constructor(title) {
    this.title = title;
  }

  log(stepName, message, info) {
    const args = [
      `${stepName}:`.cyan
    ];

    if (typeof message === 'string') {
      args.push(message);
    }

    if (typeof info === 'string') {
      args.push(`${info}`.yellow);
    }

    console.log.apply(undefined, args);
  }

  async run(args) {
    console.log(Command.APP_NAME, `${this.title}`.cyan, '...\n');
  }
}

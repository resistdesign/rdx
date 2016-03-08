import 'colors';
import Path from 'path';
import ExtendError from 'extend-error';

const CommandError = Error.extend('CommandError', 'COMMAND_ERROR');

function capitalize(string) {
  let newStr = string;

  if (typeof newStr === 'string' && newStr.length > 1) {
    newStr = string.charAt(0).toUpperCase() + string.slice(1);
  }

  return newStr;
}

function throwCommandError(name) {
  const commandError = new CommandError(`Unrecognized command: ${name}`);

  throw commandError;
};

export default class Command {
  static APP_NAME = 'RDX';

  static async exec(name, args, commandRoot) {
    let fullPath,
      CommandClass,
      CommandInstance;

    try {
      fullPath = Path.join.apply(undefined, [commandRoot].concat(
        name.split(':')
          .map(namePart => {
            return capitalize(namePart);
          })
      ));
      CommandClass = require(fullPath);
      CommandInstance = new CommandClass();
    } catch (error) {
      throwCommandError(name);
    }

    if (!(CommandInstance instanceof Command)) {
      throwCommandError(name);
    }

    return await CommandInstance.run(args);
  }

  name;
  usageDescriptor;

  constructor(name = 'command name here', usageDescriptor = {'--flag': 'What it does!'}) {
    this.name = name;
    this.usageDescriptor = usageDescriptor;
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
    console.log(Command.APP_NAME, `${this.name}`.cyan, '...\n');

    // Command was executed with `-h`.
    if (args.h) {
      if (this.usageDescriptor instanceof Object) {
        console.log('USAGE:'.cyan, '\n');

        for (let k in this.usageDescriptor) {
          if (this.usageDescriptor.hasOwnProperty(k)) {
            console.log(`\t${k}: ${this.usageDescriptor[k]}`, '\n');
          }
        }
      }

      process.exit(0);
    }
  }
}

import 'colors';
import Path from 'path';
import ErrorLogger from '../Utils/ErrorLogger';

function capitalize(string) {
  let newStr = string;

  if (typeof newStr === 'string' && newStr.length > 1) {
    newStr = string.charAt(0).toUpperCase() + string.slice(1);
  }

  return newStr;
}

function throwCommandError(name) {
  throw new Error(`Unrecognized command: ${name}`);
}

export default class Command {
  static PATH = __filename;
  static APP_NAME = 'rdx';

  static logError(error, warning = false, skipPath) {
    ErrorLogger.logError(error, warning, skipPath);
  }

  static async exec(name, args, commandRoot) {
    let fullPath,
      CommandClass,
      CommandClassPath,
      CommandInstance;

    try {
      fullPath = Path.join.apply(undefined, [commandRoot].concat(
        name.split(':')
          .map(namePart => {
            return capitalize(namePart);
          })
      ));
      CommandClassPath = require.resolve(fullPath);
    } catch (error) {
      throwCommandError(name);
    }

    CommandClass = require(CommandClassPath);
    CommandInstance = new CommandClass();

    if (!(CommandInstance instanceof Command)) {
      throwCommandError(name);
    }

    return await CommandInstance.run(args);
  }

  name;
  usageDescriptor;

  constructor(name = 'command name here', usageDescriptor = { '--flag': 'What it does!' }) {
    this.name = name;
    this.usageDescriptor = usageDescriptor;
  }

  log(stepName, message, info) {
    const args = stepName ? [
      `${stepName}:`.cyan
    ] : [];

    if (typeof message === 'string') {
      args.push(message);
    }

    if (typeof info === 'string') {
      args.push(`${info}`.yellow);
    }

    console.log.apply(undefined, args);
  }

  async run(args, omitName) {
    if (!omitName) {
      console.log(Command.APP_NAME, `${this.name}`.cyan, '...\n');
    }

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

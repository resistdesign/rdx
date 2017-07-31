import 'colors';
import Path from 'path';
import ErrorLogger from '../Utils/ErrorLogger';
import PackageInfo from '../Utils/PackageInfo';
import Print from '../Utils/General';

function capitalize (string) {
  let newStr = string;

  if (typeof newStr === 'string' && newStr.length > 1) {
    newStr = string.charAt(0).toUpperCase() + string.slice(1);
  }

  return newStr;
}

function throwCommandError (name) {
  throw new Error(`Unrecognized command: ${name}`);
}

export default class Command {
  static PATH = __filename;
  static APP_NAME = 'rdx';

  static findRoot () {
    try {
      return PackageInfo.findRoot(process.cwd());
    } catch (error) {
      // Ignore.
    }
  }

  static logError (error, warning = false, skipPath) {
    ErrorLogger.logError(error, warning, skipPath);
  }

  static async exec (name, args, commandRoot) {
    const packInfo = new PackageInfo(Command.APP_NAME);
    const mergedArgs = {
      ...packInfo.getConfig(name),
      ...args
    };

    let fullPath,
      CommandClassPath;

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

    const CommandClass = require(CommandClassPath);
    const CommandInstance = new CommandClass();

    if (!(CommandInstance instanceof Command)) {
      throwCommandError(name);
    }

    return await CommandInstance.run(mergedArgs);
  }

  name;
  usageDescriptor;

  constructor (name = 'command name here', usageDescriptor = { '--flag': 'What it does!' }) {
    this.name = name;
    this.usageDescriptor = usageDescriptor;
  }

  log (stepName, message, info) {
    const args = stepName ? [
      `${stepName}:`.cyan
    ] : [];

    if (typeof message === 'string') {
      args.push(message);
    }

    if (typeof info === 'string') {
      args.push(`${info}`.yellow);
    }

    Print(...args);
  }

  async runBase (args, omitName) {
    if (!omitName) {
      Print(Command.APP_NAME, `${this.name}`.cyan, '...\n');
    }

    // Command was executed with `-h`.
    if (args.h) {
      if (this.usageDescriptor instanceof Object) {
        Print('USAGE:'.cyan, '\n');

        for (const k in this.usageDescriptor) {
          if (this.usageDescriptor.hasOwnProperty(k)) {
            Print(`\t${k}: ${this.usageDescriptor[k]}`, '\n');
          }
        }
      }

      process.exit(0);
    }
  }
}

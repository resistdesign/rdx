import Path from 'path';
import Minimist from 'minimist';
import Command from './Base/Command';

const COMMAND_ROOT = Path.join(__dirname, 'Commands');
const ARGS = Minimist(process.argv.slice(2));
const COMMANDS = (ARGS || {})._;

if (COMMANDS instanceof Array && COMMANDS.length) {
  const cmd = COMMANDS[0];

  Command.exec(cmd, ARGS, COMMAND_ROOT);
} else {
  Command.exec('default', ARGS, COMMAND_ROOT);
}

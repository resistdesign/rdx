import 'colors';
import Path from 'path';
import Minimist from 'minimist';
import Command from './Base/Command';
import ErrorLogger from './Utils/ErrorLogger';
import Print from './Utils/General';

const COMMAND_ROOT = Path.join(__dirname, 'Commands');
const ARGS = Minimist(process.argv.slice(2));
const COMMANDS = (ARGS || {})._;
const startTime = new Date().getTime();

function getTotalTimeInSeconds() {
  const endTime = new Date().getTime();
  return (endTime - startTime) / 1000;
}

async function RDX() {
  if (COMMANDS instanceof Array && COMMANDS.length) {
    const cmd = COMMANDS[0];

    return await Command.exec(cmd, ARGS, COMMAND_ROOT);
  } else {
    return await Command.exec('default', ARGS, COMMAND_ROOT);
  }
}

Print('RDX'.cyan);

RDX()
  .then(result => {
    const secs = getTotalTimeInSeconds();

    if (typeof result === 'string') {
      Print(`\n\n${String(result).cyan}`);
    }

    Print('\nFINISHED IN:'.cyan, `${secs} seconds.`.yellow);
  }, error => {
    const secs = getTotalTimeInSeconds();

    ErrorLogger.logError(error, false, Command.PATH);
    Print('FINISHED WITH ERRORS IN:'.red, `${secs} seconds.`.yellow);
  });

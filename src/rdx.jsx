import 'colors';
import Path from 'path';
import Minimist from 'minimist';
import Command from './Base/Command';
import ErrorLogger from './Utils/ErrorLogger';

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

console.log('PROCESSSED', apple);
console.log('RDX'.cyan);

RDX()
  .then(result => {
    const secs = getTotalTimeInSeconds();

    if (typeof result === 'string') {
      console.log(`\n\n${String(result).cyan}`);
    }

    console.log('\nFINISHED IN:'.cyan, `${secs} seconds.`.yellow);
  }, error => {
    const secs = getTotalTimeInSeconds();

    ErrorLogger.logError(error, false, Command.PATH);
    console.log('FINISHED WITH ERRORS IN:'.red, `${secs} seconds.`.yellow);
  });

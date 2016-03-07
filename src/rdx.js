import Path from 'path';
import Minimist from 'minimist';
import Command from './Base/Command';

const COMMAND_ROOT = Path.join(__dirname, 'Commands');
const ARGS = Minimist(process.argv.slice(2));
const COMMANDS = (ARGS || {})._;

async function RDX() {
  if (COMMANDS instanceof Array && COMMANDS.length) {
    const cmd = COMMANDS[0];

    await Command.exec(cmd, ARGS, COMMAND_ROOT);
  } else {
    await Command.exec('default', ARGS, COMMAND_ROOT);
  }
}

const startTime = new Date().getTime();

RDX()
  .then(() => {
    const endTime = new Date().getTime();
    const secs = (endTime - startTime) / 1000;

    console.log('FINISHED IN:', `${secs} seconds.`.yellow);
  }, error => {
    console.error(error);
  });

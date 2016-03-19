import 'colors';
import Path from 'path';
import Minimist from 'minimist';
import Command from './Base/Command';
import PrettyError from 'pretty-error';
import PrettyErrorConfig from './Config/PrettyError';

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

    await Command.exec(cmd, ARGS, COMMAND_ROOT);
  } else {
    await Command.exec('default', ARGS, COMMAND_ROOT);
  }
}

console.log('RDX'.cyan);

RDX()
  .then(() => {
    const secs = getTotalTimeInSeconds();

    console.log('FINISHED IN:'.cyan, `${secs} seconds.`.yellow);
  }, error => {
    const secs = getTotalTimeInSeconds();
    const prettyError = new PrettyError();
    prettyError.appendStyle(PrettyErrorConfig);
    prettyError.skipNodeFiles();
    prettyError.skipPackage('regenerator', 'core-js');
    prettyError.skipPath(Command.PATH);

    console.log('ERROR:'.red, prettyError.render(error));
    console.log('FINISHED WITH ERRORS IN:'.red, `${secs} seconds.`.yellow);
  });

const { spawn: ChildProcessSpawn } = require('child_process');
const { parse: ShellQuoteParse } = require('shell-quote');

const COMMAND_LINE_CONSTANTS = {
  ERRORS: {
    COMMAND_FAILED: 'COMMAND_FAILED'
  }
};

const execCommandInline = async (command = '') => await new Promise((res, rej) => {
  try {
    const [
      commandName,
      ...args
    ] = ShellQuoteParse(command);
    const childProcess = ChildProcessSpawn(
      commandName,
      args,
      {
        cwd: process.cwd(),
        stdio: 'inherit'
      }
    );

    childProcess.on(
      'close',
      code => {
        if (code !== 0) {
          const commandError = new Error(COMMAND_LINE_CONSTANTS.ERRORS.COMMAND_FAILED);

          Object.assign(commandError, { code });

          rej(commandError);
        } else {
          res(true);
        }
      }
    );
  } catch (error) {
    rej(error);
  }
});

module.exports = {
  COMMAND_LINE_CONSTANTS,
  execCommandInline
};

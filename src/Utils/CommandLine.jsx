import { spawn as ChildProcessSpawn } from 'child_process';
import { parse as ShellQuoteParse } from 'shell-quote';

export const COMMAND_LINE_CONSTANTS = {
  ERRORS: {
    COMMAND_FAILED: 'COMMAND_FAILED'
  }
};

export const execCommandInline = async (command = '', cwd = process.cwd()) => await new Promise((res, rej) => {
  try {
    const [
      commandName,
      ...args
    ] = ShellQuoteParse(command);
    const childProcess = ChildProcessSpawn(
      commandName,
      args,
      {
        cwd,
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

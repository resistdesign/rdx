import Command from '../Base/Command';

export default class Compile extends Command {
  constructor() {
    super('compile');
  }

  async run() {
    await super.run();

    this.log('Start', 'Running the compiler on', 'index.html');
  }
}
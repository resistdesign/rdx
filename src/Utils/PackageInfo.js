import Path from 'path';
import FS from 'fs';
import FindRoot from 'find-root';

export default class PackageInfo {
  static PACKAGE_FILE = 'package.json';

  static findRoot(from) {
    return FindRoot(from);
  }

  appName;
  info;

  constructor(appName) {
    this.appName = appName;

    try {
      const packString = FS.readFileSync(
        Path.join(
          PackageInfo.findRoot(process.cwd()),
          PackageInfo.PACKAGE_FILE
        ),
        {
          encoding: 'utf8'
        }
      );

      this.info = JSON.parse(packString);
    } catch (error) {
      // Ignore.
    }
  }

  getConfig(command) {
    try {
      return {
        ...this.info[this.appName][command]
      };
    } catch (error) {
      // Ignore.
    }
  }
}

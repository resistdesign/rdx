import 'colors';
import PrettyError from 'pretty-error';
import PrettyErrorConfig from '../Config/PrettyError';

export default class ErrorLogger {
  static logError(error, warning = false, skipPath) {
    const prettyError = new PrettyError();
    prettyError.appendStyle(PrettyErrorConfig);
    prettyError.skipNodeFiles();
    prettyError.skipPackage('regenerator', 'core-js');

    if (skipPath) {
      prettyError.skipPath(skipPath);
    }

    if (warning) {
      console.log('WARNING:'.yellow, prettyError.render(error));
    } else {
      console.log('ERROR:'.red, prettyError.render(error));
    }
  }
}
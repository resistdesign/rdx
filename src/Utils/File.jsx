import Path from 'path';
import FS from 'fs-extra';
import Glob from 'glob';

export const getFileList = (directory = '') => {
  const globString = Path.join(directory, '**', '*');

  return Glob.sync(globString);
};

import Path from 'path';
import FS from 'fs-extra';
import Glob from 'glob';

export const getFileList = (directory = '') => {
  const globString = Path.join(directory, '**', '*');

  return Glob.sync(globString);
};

export const readFile = async ({
                                 fullPath = '',
                                 binary = false
                               }: {
  fullPath?: string,
  binary?: boolean
} = {}) => await FS.readFile(
  fullPath,
  {
    encoding: !!binary ? 'binary' : 'utf8'
  }
);

export const writeFile = async ({
                                  fullPath = '',
                                  data,
                                  binary = false
                                }: {
  fullPath?: string,
  data: any,
  binary?: boolean
} = {}) => await FS.writeFile(
  fullPath,
  data,
  {
    encoding: !!binary ? 'binary' : 'utf8'
  }
);

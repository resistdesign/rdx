import Path from 'path';
import FS from 'fs';
import Glob from 'glob';
import {CWD} from './Path';

export const FILE_ENCODING_TYPES = {
  BINARY: 'binary',
  UTF8: 'utf8'
};

export const getFileEncoding = ({
                                  binary = false
                                }: {
  binary?: boolean
} = {}): string => !!binary ? FILE_ENCODING_TYPES.BINARY : FILE_ENCODING_TYPES.UTF8;

export const globSearch = async ({
                                   pattern = '',
                                   cwd = CWD
                                 }: {
  pattern: string,
  cwd?: string
} = {}) => await new Promise(
  (res, rej) => Glob(
    pattern,
    {
      cwd
    },
    (error, matches) => {
      if (!!error) {
        rej(error);
      } else {
        res(matches);
      }
    }
  )
);

export class File {
  cwd: string;
  globSearch: typeof globSearch;
  fileSystem: typeof FS;

  constructor(config = {}) {
    Object.assign(this, config);

    this.cwd = this.cwd || CWD;
    this.globSearch = this.globSearch || globSearch;
    this.fileSystem = this.fileSystem || FS;
  }

  listDirectory = async ({
                           directory = ''
                         }: {
    directory: string
  } = {}) => await this.globSearch({
    pattern: Path.join(directory, '**', '*'),
    cwd: this.cwd
  });


  readFile = async ({
                      path = '',
                      binary = false
                    }: {
    path: string,
    binary?: boolean
  } = {}) => await new Promise((res, rej) => this.fileSystem.readFile(
    Path.relative(this.cwd, path),
    {
      encoding: (getFileEncoding({binary}): string)
    },
    (error, data) => {
      if (!!error) {
        rej(error);
      } else {
        res(data);
      }
    }
  ));

  writeFile = async ({
                       path = '',
                       data,
                       binary = false
                     }: {
    path: string,
    data: any,
    binary?: boolean
  } = {}) => await new Promise((res, rej) => this.fileSystem.writeFile(
    Path.relative(this.cwd, path),
    data,
    {
      encoding: (getFileEncoding({binary}): string)
    },
    (error) => {
      if (!!error) {
        rej(error);
      } else {
        res(true);
      }
    }
  ));
}

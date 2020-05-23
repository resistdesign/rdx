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

export const getFullPath = ({
                              path = '',
                              cwd = CWD
                            }: {
  path: string,
  cwd?: string
} = {}): string => Path.isAbsolute(path) ?
  Path.normalize(path) :
  Path.normalize(Path.join(cwd, path));

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

  pathExists = async ({
                        path = ''
                      }: {
    path: string
  } = {}) => await new Promise((res) => this.fileSystem.access(
    path,
    FS.constants.F_OK,
    (error) => {
      if (!!error) {
        res(false);
      } else {
        res(true);
      }
    }
  ));

  ensureDirectory = async ({
                             directory = ''
                           }: {
    directory: string
  } = {}) => {
    const fullDirectory = getFullPath({path: directory, cwd: this.cwd});
    const directoryList = fullDirectory
      .split(Path.sep)
      .reduce(
        (acc, p) => [
          ...acc,
          `${acc[acc.length - 1] || ''}${Path.sep}${p}`
        ],
        []
      );

    for (const d of directoryList) {
      try {
        await new Promise((res, rej) => this.fileSystem.mkdir(
          d,
          {},
          (error) => {
            if (!!error) {
              rej(error);
            } else {
              res(true);
            }
          }
        ));
      } catch (error) {
        // Ignore.
      }
    }
  };

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
    getFullPath({path, cwd: this.cwd}),
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
  } = {}) => {
    await this.ensureDirectory({directory: Path.dirname(path)});

    return await new Promise((res, rej) => this.fileSystem.writeFile(
      getFullPath({path, cwd: this.cwd}),
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
  };

  copyFile = async ({
                      fromPath = '',
                      toPath = '',
                      binary = false
                    }: {
    fromPath: string,
    toPath: string,
    binary?: boolean
  } = {}) => await this.writeFile({
    path: toPath,
    data: await this.readFile({
      path: fromPath,
      binary
    }),
    binary
  });
}

export default File;

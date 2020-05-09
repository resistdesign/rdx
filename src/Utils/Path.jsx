import Path from 'path';

export const CWD = process.cwd();

export const getFullTargetPath = (path = '', cwd = CWD): string =>
  Path.join(cwd, path);

export const getRelativePath = (path = '', fromPath = CWD) =>
  Path.relative(fromPath, path);

import Path from 'path';

export const CWD = process.cwd();

export const getFullTargetPath = (path = '') => Path.join(CWD, path);

export const getRelativePath = (path = '', fromPath = CWD) =>
  Path.relative(fromPath, path);

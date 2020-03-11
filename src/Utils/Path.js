const Path = require('path');

const CWD = process.cwd();

/**
 * Current working directory related tools.
 * */
module.exports = {
  /**
   * The current working directory.
   * @type {string}
   * */
  CWD,
  /**
   * Get the full, absolute path with CWD.
   * @param {string} path A path relative to the CWD.
   * @returns {string} The full path.
   * */
  getFullTargetPath: (path = '') => Path.join(CWD, path),
  /**
   * Convert an absolute path relative to another.
   * @param {string} path The absolute path to convert.
   * @param {string} fromPath The absolute path used as the base for the relative path. Default: `CWD`
   * @returns {string} The relative path.
   * */
  getRelativePath: (path = '', fromPath = CWD) => Path.relative(fromPath, path)
};

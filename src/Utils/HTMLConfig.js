const Path = require('path');
const FS = require('fs');
const Cheerio = require('cheerio');

const getRelativeImportOutputPath = ({
                                       fullContextPath = '',
                                       fullRequesterFilePath = '',
                                       relativeImportPath = ''
                                     } = {}) => Path
  .join(
    Path.relative(
      fullContextPath,
      Path.dirname(fullRequesterFilePath)
    ),
    relativeImportPath
  );

class HTMLConfig {
  hash;
  fullFilePath;
  fullContextPath;

  constructor (config = {}) {
    Object.assign(this, config);
  }

  getCurrentData = () => {
    const self = this;
    const content = FS.readFileSync(this.fullFilePath, { encoding: 'utf8' });
    const parser = Cheerio.load(content);
    const hrefNodes = parser('[href]:not(a)');
    const srcNodes = parser('[src]');
    const entry = {};
    const getPathProcessor = (attrName = '') => function () {
      const elem = parser(this);
      const sourcePath = elem.attr(attrName);
      const outputPath = getRelativeImportOutputPath({
        fullContextPath: self.fullContextPath,
        fullRequesterFilePath: self.fullFilePath,
        relativeImportPath: sourcePath
      });
      // TODO: Skip Files To Be Copied, URLs and Web Workers.
      // TODO: Sort out Web Workers for separate compilation.
      entry[outputPath] = outputPath;

      elem.attr(attrName, `${sourcePath}?${self.hash}`);
    };

    hrefNodes.each(getPathProcessor('href'));
    srcNodes.each(getPathProcessor('src'));

    return {
      content: parser.html(),
      entry
    };
  };
}

module.exports = HTMLConfig;

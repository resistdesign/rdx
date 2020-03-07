import Crypto from 'crypto';
import Path from 'path';
import Cheerio from 'cheerio';

export const getRelativeImportOutputPath = ({
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
export const getContentHash = (content = '') => {
  const hash = Crypto.createHash('sha256');

  hash.update(content, 'utf8');

  return hash.digest('hex');
};
export const getHTMLReferencePathProcessor = ({
                                                parser = {},
                                                attrName = '',
                                                fullFilePath = '',
                                                fullContextPath = '',
                                                contentHash = '',
                                                entry = {}
                                              } = {}) => function () {
  const elem = parser(this);
  const sourcePath = elem.attr(attrName);
  const outputPath = getRelativeImportOutputPath({
    fullContextPath: fullContextPath,
    fullRequesterFilePath: fullFilePath,
    relativeImportPath: sourcePath
  });
  // TODO: Skip URLs and Web Workers.
  // TODO: Sort out Web Workers for separate compilation.
  entry[outputPath] = outputPath;

  elem.attr(attrName, `${sourcePath}?${contentHash}`);
};

export default class HTMLConfig {
  content;
  fullFilePath;
  fullContextPath;

  constructor (config = {}) {
    Object.assign(this, config);
  }

  getCurrentData = () => {
    const contentHash = getContentHash(this.content);
    const parser = Cheerio.load(this.content);
    const hrefNodes = parser('[href]:not(a)');
    const srcNodes = parser('[src]');
    const entry = {};
    const baseHTMLReferencePathProcessorConfig = {
      parser,
      fullFilePath: this.fullFilePath,
      fullContextPath: this.fullContextPath,
      contentHash,
      entry
    };

    hrefNodes.each(getHTMLReferencePathProcessor({
      ...baseHTMLReferencePathProcessorConfig,
      attrName: 'href'
    }));
    srcNodes.each(getHTMLReferencePathProcessor({
      ...baseHTMLReferencePathProcessorConfig,
      attrName: 'src'
    }));

    return {
      contentHash,
      content: parser.html(),
      entry
    };
  };
}

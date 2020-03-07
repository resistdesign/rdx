import Crypto from 'crypto';
import Path from 'path';
import Cheerio from 'cheerio';

const URL_REGEX = /^([a-z]|:)*?(?<!\/.)\/\/[a-z0-9-.]*?($|\/.*?$|\?.*?$)/gmi;

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
  const sourcePath = elem.attr(attrName) || '';
  const outputPath = getRelativeImportOutputPath({
    fullContextPath: fullContextPath,
    fullRequesterFilePath: fullFilePath,
    relativeImportPath: sourcePath
  });

  // TODO: Sort out Web Workers for separate compilation.
  // IMPORTANT: Skip URLs.
  if (!sourcePath.match(URL_REGEX)) {
    entry[outputPath] = outputPath;

    elem.attr(attrName, `${sourcePath}?${contentHash}`);
  }
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

    // TODO: Also return the entry for the HTML file itself.
    return {
      contentHash,
      content: parser.html(),
      entry
    };
  };
}

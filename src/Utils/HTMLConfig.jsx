import Crypto from 'crypto';
import Path from 'path';
import Cheerio from 'cheerio';

const URL_REGEX = /^([a-z]|:)*?(?<!\/.)\/\/[a-z0-9-.]*?($|\/.*?$|\?.*?$)/gmi;
const HTML_PROCESSING_FLAGS = {
  PRELOAD: 'preload',
  PREFETCH: 'prefetch',
  WORKER: 'worker'
};

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
                                                entry = {},
                                                workerEntry = {}
                                              } = {}) => function () {
  const elem = parser(this);
  const sourcePath = elem.attr(attrName) || '';
  const rel = `${elem.attr('rel')}`.toLowerCase();
  const asValue = `${elem.attr('as')}`.toLowerCase();
  const sourceIsWorker = asValue === HTML_PROCESSING_FLAGS.WORKER;
  const outputPath = getRelativeImportOutputPath({
    fullContextPath: fullContextPath,
    fullRequesterFilePath: fullFilePath,
    relativeImportPath: sourcePath
  });

  if (
    // Skip URLs and preloaded content.
    !sourcePath.match(URL_REGEX) &&
    (
      // TRICKY: Skip preloaded/prefetched files *except* workers.
      sourceIsWorker ||
      (
        rel !== HTML_PROCESSING_FLAGS.PRELOAD &&
        rel !== HTML_PROCESSING_FLAGS.PREFETCH
      )
    )
  ) {
    if (sourceIsWorker) {
      // Sort out Web Workers for separate compilation.
      workerEntry[outputPath] = outputPath;
    } else {
      entry[outputPath] = outputPath;
    }

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
    const workerEntry = {};
    const baseHTMLReferencePathProcessorConfig = {
      parser,
      fullFilePath: this.fullFilePath,
      fullContextPath: this.fullContextPath,
      contentHash,
      entry,
      workerEntry
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
      entry,
      workerEntry
    };
  };
}

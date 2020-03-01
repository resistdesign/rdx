const Path = require('path');
const Cheerio = require('cheerio');
const LoaderUtils = require('loader-utils');

module.exports = function (content) {
  const loaderContext = this;
  const {
    regExp: optionsRegExp,
    publicPath: optionsPublicPath,
    outputPath: optionsOutputPath,
    esModule = true
  } = LoaderUtils.getOptions(loaderContext);
  // TODO: Get a tree from the HTML content.
  const $ = Cheerio.load(content);
  // TODO: Search for dependency paths.
  const hrefNodes = $('[href]:not(a)');
  const srcNodes = $('[src]');
  const importItems = [];

  const createImportLoader = (attrName) => function () {
    const elem = $(this);
    const sourcePath = elem.attr(attrName);

    if (LoaderUtils.isUrlRequest(href)) {
      const request = LoaderUtils.urlToRequest(sourcePath);
      const stringifiedRequest = LoaderUtils.stringifyRequest(loaderContext, request);

      // TODO: Replace paths in `tree` with those appropriate for the output.
      // TODO: Add cache busting (with a tag attribute option to disable it) to each output path.

      if (esModule) {
        importItems.push(`import ${stringifiedRequest};`);
      } else {
        importItems.push(
          `require(${stringifiedRequest});`
        );
      }
    }
  };

  hrefNodes.each(createImportLoader('href'));
  srcNodes.each(createImportLoader('src'));

  const url = LoaderUtils.interpolateName(
    this,
    '[path][name].[ext]?[contenthash]',
    {
      context: loaderContext.rootContext,
      content,
      regExp: optionsRegExp
    }
  );

  let outputPath = url;

  if (optionsOutputPath) {
    if (typeof optionsOutputPath === 'function') {
      outputPath = optionsOutputPath(url, loaderContext.resourcePath, loaderContext.rootContext);
    } else {
      outputPath = Path.posix.join(optionsOutputPath, url);
    }
  }

  let publicPath = `__webpack_public_path__ + ${JSON.stringify(outputPath)}`;

  if (publicPath) {
    if (typeof optionsPublicPath === 'function') {
      publicPath = optionsPublicPath(url, loaderContext.resourcePath, loaderContext.rootContext);
    } else {
      publicPath = `${
        optionsPublicPath.endsWith('/')
          ? optionsPublicPath
          : `${optionsPublicPath}/`
      }${url}`;
    }

    publicPath = JSON.stringify(publicPath);
  }

  // Convert the tree back to HTML and emit it.
  this.emitFile(outputPath, $.html());

  // Return the imported files.
  return `${importItems.join('\n')}
${esModule ? 'export default' : 'module.exports ='} ${publicPath};`;
};

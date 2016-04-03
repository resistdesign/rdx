import Path from 'path';
import WebPack from 'webpack';

function getOutputFileName(filePath, hash) {
  return `${Path.basename(filePath, Path.extname(filePath))}.${hash}${Path.extname(filePath)}`;
}

export default function () {
  this.cacheable && this.cacheable();

  const loaderOpts = this.options.htmlJSAsset;

  const callback = this.async();
  const filePath = this.resource;
  const context = loaderOpts.output.context;
  const entryName = Path.relative(
    Path.join(process.cwd(), context),
    filePath
  );
  const outputFileDir = Path.dirname(entryName);
  const outputFileName = getOutputFileName(
    filePath,
    '[hash]'
  );

  const entry = {
    [entryName]: filePath
  };

  const compiler = WebPack({
    ...loaderOpts,
    entry,
    output: {
      ...loaderOpts.output,
      filename: Path.join(
        outputFileDir,
        outputFileName
      )
    }
  });

  compiler.run(function (err, stats) {
    const outputFilePath = Path.sep +
      Path.join(
        outputFileDir,
        getOutputFileName(
          stats.toJson().modules[0].name,
          stats.compilation.hash
        )
      );

    callback(
      err,
      `module.exports = ${JSON.stringify(outputFilePath)}`
    );
  });
}

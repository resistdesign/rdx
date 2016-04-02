import Path from 'path';
import WebPack from 'webpack';

function getFileName(fpath) {
  return Path.basename(fpath, Path.extname(fpath));
}

export default function () {
  this.cacheable && this.cacheable();

  var opts = this.options;
  var loaderOpts = this.options.htmlJSAsset;

  var callback = this.async();
  var filePath = this.resource;

  var entry = {};
  entry[getFileName(filePath)] = filePath;

  var compiler = WebPack({
    ...loaderOpts,
    entry
  });

  compiler.run(function (err, stats) {
    // TODO: Do something with the error.
    var outputFilePath = Path.relative(
      opts.output.path,
      Path.join(loaderOpts.output.path, stats.toJson().assets[0].name)
    );

    callback(err, `module.exports = ${JSON.stringify(outputFilePath)}`);
  });
}

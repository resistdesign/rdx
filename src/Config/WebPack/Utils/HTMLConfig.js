import Path from 'path';
import FS from 'fs';
import HTMLEntryPoint from './HTMLEntryPoint';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default class HTMLConfig {
  static load(htmlFilePath, contextPath) {
    const htmlSourcePath = Path.resolve(htmlFilePath);
    const htmlEntry = new HTMLEntryPoint(FS.readFileSync(htmlFilePath, { encoding: 'utf8' }));
    const htmlEntryMap = htmlEntry.getEntrypoints();
    const htmlContextPath = Path.dirname(htmlFilePath);
    const htmlOutputContextPath = Path.relative(contextPath, htmlContextPath);
    const htmlName = Path.basename(htmlFilePath);
    const entry = {};
    const plugins = [
      // Secret Weapon!
      function () {
        this.plugin('emit', function (compilation, callback) {
          const {
            assets,
            hash
          } = compilation;
          const htmlAssetKey = `${Path.join(htmlOutputContextPath, htmlName)}?${hash}`;

          for (const k in entry) {
            if (entry.hasOwnProperty(k)) {
              const keyWithHash = `${Path.join(htmlOutputContextPath, k)}?${hash}`;
              const ext = Path.extname(k);

              if (
                ext !== '.js' &&
                ext !== '.jsx' &&
                assets.hasOwnProperty(keyWithHash)
              ) {
                delete assets[keyWithHash];
              }
            }
          }

          // Replace the HTML Application in the asset pipeline.
          assets[htmlAssetKey] = {
            source: function () {
              return new Buffer(htmlEntry.toHTML(htmlEntry.nodes, hash))
            },
            size: function () {
              return Buffer.byteLength(this.source(), 'utf8');
            }
          };

          callback();
        });
      }
    ];
    const loaders = [
      {
        test: htmlSourcePath,
        loader: require.resolve('ignore-loader')
      }
    ];

    for (const k in htmlEntryMap) {
      if (htmlEntryMap.hasOwnProperty(k)) {
        const ext = Path.extname(k);

        let sourcePath = Path.resolve(Path.join(htmlContextPath, htmlEntryMap[k]));

        if (ext === '.css' || ext === '.less') {
          sourcePath += '?CSSEntryPoint';

          const extractCSS = new ExtractTextPlugin(Path.join(
            htmlOutputContextPath,
            k
          ));
          const loadCSS = {
            test: sourcePath,
            loader: extractCSS.extract([
              require.resolve('css-loader'),
              require.resolve('less-loader'),
              require.resolve('postcss-loader')
            ])
          };

          plugins.push(extractCSS);
          loaders.push(loadCSS);
        }

        entry[k] = sourcePath;
      }
    }

    // Add the HTML Application entry point.
    entry[htmlName] = htmlSourcePath;

    return {
      htmlEntry,
      entry,
      output: {
        filename: Path.join(
          htmlOutputContextPath,
          '[name]?[hash]'
        )
      },
      plugins,
      module: {
        loaders
      }
    };
  }
}
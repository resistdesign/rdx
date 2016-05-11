import Path from 'path';
import FS from 'fs';
import HTMLEntryPoint from './HTMLEntryPoint';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default class HTMLConfig {
  static CSS_ENTRY_POINT_POSTFIX = '?CSSEntryPoint';

  static load(htmlFilePath, contextPath, inlineContent = '', serve = false, host, port) {
    const htmlSourcePath = Path.resolve(htmlFilePath);
    const htmlEntry = new HTMLEntryPoint(FS.readFileSync(htmlFilePath, { encoding: 'utf8' }));
    const htmlEntryMap = htmlEntry.getEntrypoints();
    const htmlContextPath = Path.dirname(htmlFilePath);
    const htmlOutputContextPath = Path.relative(contextPath, htmlContextPath);
    const htmlDestinationPath = Path.join(htmlOutputContextPath, Path.basename(htmlFilePath));
    const entry = {};
    const plugins = [
      // Secret Weapon!
      function () {
        this.plugin('emit', function (compilation, callback) {
          const {
            assets,
            hash
          } = compilation;

          for (const k in entry) {
            if (entry.hasOwnProperty(k)) {
              const ext = Path.extname(k);

              if (
                ext !== '.js' &&
                ext !== '.jsx' &&
                assets.hasOwnProperty(k)
              ) {
                delete assets[k];
              }
            }
          }

          // Replace the HTML Application in the asset pipeline.
          assets[htmlDestinationPath] = {
            source: function () {
              return new Buffer(htmlEntry.toHTML(htmlEntry.nodes, hash, inlineContent))
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

        let destination = ext === '.less' ? `${k}.css` : k,
          sourcePath = htmlEntryMap[k];

        if (destination && destination[0] === '/') {
          destination = destination.substr(1, destination.length);
          sourcePath = Path.relative(
            Path.resolve(htmlContextPath),
            Path.resolve(
              contextPath,
              destination
            )
          );
        } else {
          destination = Path.relative(
            Path.resolve(contextPath),
            Path.resolve(htmlContextPath, destination)
          );
        }

        sourcePath = Path.resolve(Path.join(htmlContextPath, sourcePath));

        if (ext === '.css' || ext === '.less') {
          sourcePath += HTMLConfig.CSS_ENTRY_POINT_POSTFIX;

          const extractCSS = new ExtractTextPlugin(`${destination}?[hash]`);
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
        } else if (serve && (ext === '.js' || ext === '.jsx')) {
          sourcePath = [
            `${require.resolve('webpack-dev-server/client')}?http://${host}:${port}`,
            require.resolve('webpack/hot/only-dev-server'),
            require.resolve('react-hot-loader/patch'),
            sourcePath
          ];
        }

        entry[destination] = sourcePath;
      }
    }

    // Add the HTML Application entry point.
    entry[htmlDestinationPath] = htmlSourcePath;

    return {
      entry,
      output: {
        filename: '[name]'
      },
      plugins,
      module: {
        loaders
      }
    };
  }
}
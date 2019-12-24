import Path from 'path';
import FS from 'fs';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HTMLEntryPoint from './HTMLEntryPoint';
import { postCSSConfigExists } from './HTMLConfig/PostCSSUtils';

export default class HTMLConfig {
  static CSS_ENTRY_POINT_POSTFIX = '?CSSEntryPoint';
  static IMPORTED_CSS_EXT = '.imported.css';

  static getCSSConfig (htmlCSSDestinationPath, serve) {
    const config = {};
    const cssLoader = require.resolve('css-loader');
    const lessLoader = require.resolve('less-loader');
    const sassLoader = require.resolve('sass-loader');
    const postCSSLoader = `${require.resolve('postcss-loader')}?${JSON.stringify({
      config: postCSSConfigExists() ?
        {
          path: process.cwd()
        } :
        {}
    })}`;
    const lessTest = /\.(less|css)$/;
    const sassTest = /\.(scss|sass)$/;

    if (serve) {
      const baseLoaders = [
        // TRICKY: See comments in PatchedStyleLoader.
        require.resolve('./CustomLoaders/PatchedStyleLoader'),
        cssLoader
      ];

      config.loaders = [
        {
          test: lessTest,
          loader: [
            ...baseLoaders,
            lessLoader,
            postCSSLoader
          ].join('!')
        },
        {
          test: sassTest,
          loader: [
            ...baseLoaders,
            sassLoader,
            postCSSLoader
          ].join('!')
        }
      ];
    } else {
      const etp = new ExtractTextPlugin(
        `${htmlCSSDestinationPath}?[hash]`
      );

      config.plugins = [etp];
      config.loaders = [
        {
          test: lessTest,
          loader: etp.extract(
            [
              cssLoader,
              lessLoader,
              postCSSLoader
            ].join('!')
          )
        },
        {
          test: sassTest,
          loader: etp.extract(
            [
              cssLoader,
              sassLoader,
              postCSSLoader
            ].join('!')
          )
        }
      ];
    }

    return config;
  }

  static load (htmlFilePath, contextPath, inlineContent = '', serve = false, host, port, protocol) {
    const htmlSourcePath = Path.resolve(htmlFilePath);
    const htmlEntry = new HTMLEntryPoint(FS.readFileSync(htmlFilePath, { encoding: 'utf8' }), serve);
    const htmlEntryMap = htmlEntry.getEntrypoints();
    const htmlContextPath = Path.dirname(htmlFilePath);
    const htmlOutputContextPath = Path.relative(contextPath, htmlContextPath);
    const htmlFileName = Path.basename(htmlFilePath);
    const htmlDestinationPath = Path.join(htmlOutputContextPath, htmlFileName);
    const htmlCSSFileName = `${htmlFileName}${HTMLConfig.IMPORTED_CSS_EXT}`;
    const htmlCSSDestinationPath = Path.join(htmlOutputContextPath, htmlCSSFileName);
    const cssConfig = HTMLConfig.getCSSConfig(htmlCSSDestinationPath, serve);
    const entry = {};
    const plugins = [
      // Secret Weapon!
      function () {
        // eslint-disable-next-line
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
              const cssInlineContent = serve ? '' : `<link rel="stylesheet" media="all" href="./${htmlCSSFileName}?${hash}">`;
              const inlineContentWithCSSLink = `${inlineContent}${cssInlineContent}`;

              return new Buffer(htmlEntry.toHTML(htmlEntry.nodes, hash, inlineContentWithCSSLink));
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
            `${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}`,
            require.resolve('webpack/hot/only-dev-server'),
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
      plugins: [
        ...(cssConfig.plugins || []),
        ...plugins
      ],
      module: {
        loaders: [
          ...(cssConfig.loaders || []),
          ...loaders
        ]
      }
    };
  }
}

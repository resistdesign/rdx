import Path from 'path';
import FS from 'fs';
import HTMLEntryPoint from './Utils/HTMLEntryPoint';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import MultiConfigLoader from './Utils/MultiConfigLoader';

const PLUGINS_CONFIG_TYPE = 'Plugins';
const LOADERS_CONFIG_TYPE = 'Loaders';
const SETTINGS_CONFIG_TYPE = 'Settings';

const COMMON_COMMAND_TYPE = 'Common';
const SERVE_COMMAND_TYPE = 'Serve';
const COMPILE_COMMAND_TYPE = 'Compile';

export default class WebPackConfigBuilder {
  static CONFIG_TYPES = {
    PLUGINS: PLUGINS_CONFIG_TYPE,
    LOADERS: LOADERS_CONFIG_TYPE,
    SETTINGS: SETTINGS_CONFIG_TYPE
  };
  static COMMAND_TYPES = {
    COMMON: COMMON_COMMAND_TYPE,
    SERVE: SERVE_COMMAND_TYPE,
    COMPILE: COMPILE_COMMAND_TYPE
  };

  static loadConfig(baseConfigPath, contextPath, absOutputPath, type) {
    const mcl = new MultiConfigLoader(baseConfigPath, contextPath, absOutputPath);

    return mcl.getFullConfigFromMap({
      plugins: [
        {
          configType: PLUGINS_CONFIG_TYPE,
          commandType: type
        },
        {
          configType: PLUGINS_CONFIG_TYPE,
          commandType: COMMON_COMMAND_TYPE
        }
      ],
      loaders: [
        {
          configType: LOADERS_CONFIG_TYPE,
          commandType: type
        },
        {
          configType: LOADERS_CONFIG_TYPE,
          commandType: COMMON_COMMAND_TYPE
        }
      ],
      settings: [
        {
          configType: SETTINGS_CONFIG_TYPE,
          commandType: type,
          asObject: true
        },
        {
          configType: SETTINGS_CONFIG_TYPE,
          commandType: COMMON_COMMAND_TYPE,
          asObject: true
        }
      ]
    });
  }

  static getHTMLConfig(htmlFilePath, contextPath) {
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

  static getConfig(htmlFilePath, contextPath, absOutputPath, serve = false) {
    const type = serve ? SERVE_COMMAND_TYPE : COMPILE_COMMAND_TYPE;
    const loadedConfig = WebPackConfigBuilder.loadConfig(
      __dirname,
      contextPath,
      absOutputPath,
      type
    );
    const htmlConfig = WebPackConfigBuilder.getHTMLConfig(
      htmlFilePath,
      contextPath
    );

    return {
      entry: htmlConfig.entry,
      output: {
        ...htmlConfig.output,
        path: absOutputPath,
        publicPath: '/'
      },
      plugins: [
        ...loadedConfig.plugins,
        ...htmlConfig.plugins
      ],
      module: {
        loaders: [
          ...loadedConfig.loaders,
          ...htmlConfig.module.loaders
        ]
      },
      ...loadedConfig.settings
    };
  }
}

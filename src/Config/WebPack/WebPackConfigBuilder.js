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
  static loadConfig(baseConfigPath, contextPath, absOutputPath, type) {
    const mcl = new MultiConfigLoader(baseConfigPath, contextPath, absOutputPath);

    return mcl.getFullConfigFromMap({
      typePlugins: {
        configType: PLUGINS_CONFIG_TYPE,
        commandType: type
      },
      commonPlugins: {
        configType: PLUGINS_CONFIG_TYPE,
        commandType: COMMON_COMMAND_TYPE
      },
      typeLoaders: {
        configType: LOADERS_CONFIG_TYPE,
        commandType: type
      },
      commonLoaders: {
        configType: LOADERS_CONFIG_TYPE,
        commandType: COMMON_COMMAND_TYPE
      },
      typeSettings: {
        configType: SETTINGS_CONFIG_TYPE,
        commandType: type,
        asObject: true
      },
      commonSettings: {
        configType: SETTINGS_CONFIG_TYPE,
        commandType: COMMON_COMMAND_TYPE,
        asObject: true
      }
    });
  }

  static getBaseConfig(htmlFilePath, contextPath, outputPath, serve = false) {
    const htmlEntry = new HTMLEntryPoint(FS.readFileSync(htmlFilePath, { encoding: 'utf8' }));
    const htmlEntryMap = htmlEntry.getEntrypoints();
    const entry = {};
    const htmlContextPath = Path.dirname(htmlFilePath);
    const type = serve ? SERVE_COMMAND_TYPE : COMPILE_COMMAND_TYPE;
    const baseConfigPath = __dirname;
    const htmlOutputPath = Path.relative(contextPath, htmlFilePath);
    const absOutputPath = Path.resolve(outputPath);

    const baseConfig = WebPackConfigBuilder.loadConfig(
      baseConfigPath,
      contextPath,
      absOutputPath,
      type
    );
    const {
      typePlugins,
      commonPlugins,
      typeLoaders,
      commonLoaders,
      typeSettings,
      commonSettings
    } = baseConfig;

    const cssPlugins = [];
    const cssLoaders = [];

    for (const k in htmlEntryMap) {
      if (htmlEntryMap.hasOwnProperty(k)) {
        const destinationPath = `${k}.output`;
        const ext = Path.extname(k);

        let sourcePath = Path.resolve(Path.join(htmlContextPath, htmlEntryMap[k]));

        if (ext === '.css' || ext === '.less') {
          sourcePath += '?input';

          const extractCSS = new ExtractTextPlugin(Path.join(
            Path.relative(contextPath, htmlContextPath),
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

          cssPlugins.push(extractCSS);
          cssLoaders.push(loadCSS);
        }

        entry[destinationPath] = sourcePath;
      }
    }

    // Add the HTML Application entry point.
    entry[`${htmlOutputPath}?app`] = `${htmlFilePath}?app`;

    return {
      entry,
      output: {
        path: absOutputPath,
        filename: Path.join(
          Path.relative(contextPath, htmlContextPath),
          '[name]?[hash]'
        ),
        publicPath: '/'
      },
      plugins: [
        ...(typePlugins || []),
        ...(commonPlugins || []),
        ...cssPlugins,
        function SecretWeapon() {
          this.plugin('emit', function (compilation, callback) {
            const {
              assets,
              hash
            } = compilation;

            for (const k in assets) {
              if (assets.hasOwnProperty(k)) {
                const fullExt = Path.extname(k) || '';
                const fullExtParts = fullExt.split('?');
                const normalExt = fullExtParts[0];
                const pathQuery = fullExtParts[1];

                if (normalExt === '.html' && pathQuery === 'app') {
                  delete assets[k];
                  continue;
                }

                if (normalExt === '.output') {
                  const base = Path.join(Path.dirname(k), Path.basename(k, fullExt));
                  const ext = Path.extname(base);

                  if (ext === '.js' || ext === '.jsx') {
                    const newBase = pathQuery ? `${base}?${pathQuery}` : base;

                    assets[newBase] = assets[k];
                  }

                  delete assets[k];
                }
              }
            }

            // Add the HTML Application to the asset pipeline.
            assets[htmlOutputPath] = {
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
      ],
      module: {
        loaders: [
          {
            test: /\.html\?app$/,
            loader: require.resolve('ignore-loader')
          },
          ...cssLoaders,
          ...(typeLoaders || []),
          ...(commonLoaders || [])
        ]
      },
      ...typeSettings,
      ...commonSettings
    };
  }
}

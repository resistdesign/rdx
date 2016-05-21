import MultiConfigLoader from './Utils/MultiConfigLoader';
import HTMLConfig from './Utils/HTMLConfig';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import Path from 'path';

export default class WebPackConfigBuilder {
  static CONFIG_TYPES = {
    PLUGINS: 'Plugins',
    LOADERS: 'Loaders',
    SETTINGS: 'Settings'
  };
  static COMMAND_TYPES = {
    COMMON: 'Common',
    SERVE: 'Serve',
    COMPILE: 'Compile'
  };
  static IMPORTED_CSS_EXT = '.imported.css';
  static IMPORTED_CSS_INLINE_CONTENT_KEY = 'InlineContent';

  static getCSSConfig(htmlFilePath, contextPath, serve) {
    const WPCB = WebPackConfigBuilder;
    const config = {};

    if (serve) {
      config[WPCB.IMPORTED_CSS_INLINE_CONTENT_KEY] = '';
      config[WPCB.CONFIG_TYPES.PLUGINS] = [];
      config[WPCB.CONFIG_TYPES.LOADERS] = [
        {
          test: /\.(less|css)$/,
          loader: [
            require.resolve('style-loader'),
            require.resolve('css-loader'),
            require.resolve('less-loader'),
            require.resolve('postcss-loader')
          ].join('!')
        }
      ]
    } else {
      const htmlContextPath = Path.dirname(htmlFilePath);
      const htmlOutputContextPath = Path.relative(contextPath, htmlContextPath);
      const htmlFileName = Path.basename(htmlFilePath);
      const htmlCSSFileName = `${htmlFileName}${WPCB.IMPORTED_CSS_EXT}`;
      const htmlDestinationPath = Path.join(htmlOutputContextPath, htmlCSSFileName);
      const etp = new ExtractTextPlugin(
        `${htmlDestinationPath}?[hash]`
      );

      config[WPCB.IMPORTED_CSS_INLINE_CONTENT_KEY] = `<link rel="stylesheet" href="./${htmlCSSFileName}">`;
      config[WPCB.CONFIG_TYPES.PLUGINS] = [etp];
      config[WPCB.CONFIG_TYPES.LOADERS] = [
        {
          test: /\.(less|css)$/,
          loader: etp.extract(
            require.resolve('style-loader'),
            [
              require.resolve('css-loader'),
              require.resolve('less-loader'),
              require.resolve('postcss-loader')
            ].join('!')
          )
        }
      ]
    }

    return config;
  }

  static loadConfig(baseConfigPath, contextPath, absOutputPath, commandType) {
    const mcl = new MultiConfigLoader(baseConfigPath, contextPath, absOutputPath);

    return mcl.getConfigForTypes(
      [
        WebPackConfigBuilder.CONFIG_TYPES.PLUGINS,
        WebPackConfigBuilder.CONFIG_TYPES.LOADERS,
        WebPackConfigBuilder.CONFIG_TYPES.SETTINGS
      ],
      [
        commandType,
        WebPackConfigBuilder.COMMAND_TYPES.COMMON
      ],
      [
        WebPackConfigBuilder.CONFIG_TYPES.SETTINGS
      ]
    );
  }

  static getConfig(htmlFilePath, contextPath, absOutputPath, serve = false, inlineContent = '', host, port) {
    const commandType = serve ?
      WebPackConfigBuilder.COMMAND_TYPES.SERVE :
      WebPackConfigBuilder.COMMAND_TYPES.COMPILE;
    const loadedConfig = WebPackConfigBuilder.loadConfig(
      __dirname,
      contextPath,
      absOutputPath,
      commandType
    );
    const cssConfig = this.getCSSConfig(
      htmlFilePath,
      contextPath,
      serve
    );
    const htmlConfig = HTMLConfig.load(
      htmlFilePath,
      contextPath,
      `${inlineContent}${cssConfig[WebPackConfigBuilder.IMPORTED_CSS_INLINE_CONTENT_KEY]}`,
      serve,
      host,
      port
    );

    return {
      entry: htmlConfig.entry,
      output: {
        ...htmlConfig.output,
        path: absOutputPath,
        publicPath: '/'
      },
      plugins: [
        ...loadedConfig[WebPackConfigBuilder.CONFIG_TYPES.PLUGINS],
        ...htmlConfig.plugins,
        ...cssConfig[WebPackConfigBuilder.CONFIG_TYPES.PLUGINS]
      ],
      module: {
        loaders: [
          ...loadedConfig[WebPackConfigBuilder.CONFIG_TYPES.LOADERS],
          ...htmlConfig.module.loaders,
          ...cssConfig[WebPackConfigBuilder.CONFIG_TYPES.LOADERS]
        ]
      },
      ...loadedConfig[WebPackConfigBuilder.CONFIG_TYPES.SETTINGS]
    };
  }
}

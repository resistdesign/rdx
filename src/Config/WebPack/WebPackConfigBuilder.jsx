import MultiConfigLoader from './Utils/MultiConfigLoader';
import HTMLConfig from './Utils/HTMLConfig';

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

  static loadConfig(baseConfigPath, contextPath, absOutputPath, commandType, compileTarget) {
    const mcl = new MultiConfigLoader(baseConfigPath, contextPath, absOutputPath, compileTarget);

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

  static getConfig(htmlFilePath, contextPath, absOutputPath, serve = false, inlineContent = '', host, port, compileTarget) {
    const commandType = serve ?
      WebPackConfigBuilder.COMMAND_TYPES.SERVE :
      WebPackConfigBuilder.COMMAND_TYPES.COMPILE;
    const loadedConfig = WebPackConfigBuilder.loadConfig(
      __dirname,
      contextPath,
      absOutputPath,
      commandType,
      compileTarget
    );
    const htmlConfig = HTMLConfig.load(
      htmlFilePath,
      contextPath,
      inlineContent,
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
        ...htmlConfig.plugins
      ],
      module: {
        loaders: [
          ...loadedConfig[WebPackConfigBuilder.CONFIG_TYPES.LOADERS],
          ...htmlConfig.module.loaders
        ]
      },
      ...loadedConfig[WebPackConfigBuilder.CONFIG_TYPES.SETTINGS]
    };
  }
}

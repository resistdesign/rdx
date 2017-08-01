import Path from 'path';
import Glob from 'glob';

export default class MultiConfigLoader {
  static getConfigByFullPath(fullPath, contextPath, absOutputPath, asObject = false) {
    let target = asObject ? {} : [];
    let paths = [];
    try {
      const pathPattern = Path.join(
        fullPath,
        '**/*.jsx'
      );
      paths = Glob.sync(pathPattern);
    } catch (error) {
      return target;
    }

    for (let i = 0; i < paths.length; i++) {
      const p = paths[i];

      try {
        const func = require(p);
        const value = func(contextPath, absOutputPath);

        if (asObject) {
          target = {
            ...target,
            ...value
          };
        } else {
          target = [
            ...(target || []),
            ...(value || [])
          ];
        }
      } catch (error) {
        // Ignore.
      }
    }

    return target;
  }

  static getFullConfigPath(basePath, configType, commandType) {
    return Path.join(basePath, configType, commandType);
  }

  baseConfigPath;
  contextPath;
  absOutputPath;

  constructor(baseConfigPath, contextPath, absOutputPath) {
    this.baseConfigPath = baseConfigPath;
    this.contextPath = contextPath;
    this.absOutputPath = absOutputPath;
  }

  getConfiguration(configType, commandType, asObject = false) {
    const fullConfigPath = MultiConfigLoader.getFullConfigPath(
      this.baseConfigPath,
      configType,
      commandType
    );

    return MultiConfigLoader.getConfigByFullPath(
      fullConfigPath,
      this.contextPath,
      this.absOutputPath,
      asObject
    );
  }

  getFullConfigFromMap(map = {
    configName: [
      {
        configType: '',
        commandType: '',
        asObject: false
      }
    ]
  }) {
    const fullConfig = {};

    if (map instanceof Object) {
      for (const k in map) {
        if (map.hasOwnProperty(k)) {
          const mapItemList = map[k];

          if (mapItemList instanceof Array) {
            for (let i = 0; i < mapItemList.length; i++) {
              const mapItem = mapItemList[i];
              const configItems = this.getConfiguration(
                mapItem.configType,
                mapItem.commandType,
                mapItem.asObject
              );
              const fullConfigItem = fullConfig[k];

              fullConfig[k] = mapItem.asObject ? {
                ...fullConfigItem,
                ...configItems
              } : [
                ...(fullConfigItem || []),
                ...(configItems || [])
              ];
            }
          }
        }
      }
    }

    return fullConfig;
  }

  getConfigForTypes(configTypes = [], commandTypes = [], objectTypes = []) {
    const configMap = {};

    for (let i = 0; i < configTypes.length; i++) {
      const cfgT = configTypes[i];

      for (let j = 0; j < commandTypes.length; j++) {
        const cmdT = commandTypes[j];
        const cfgTList = configMap[cfgT];

        configMap[cfgT] = [
          ...(cfgTList || []),
          {
            configType: cfgT,
            commandType: cmdT,
            asObject: objectTypes.indexOf(cfgT) !== -1
          }
        ];
      }
    }

    return this.getFullConfigFromMap(configMap);
  }
}

import Path from 'path';
import NodeBuiltins from 'builtin-modules';
import BabelConfig from 'resistdesign-babel-config';
import {getFullTargetPath, getRelativePath} from '../Utils/Path';
import WebPack from 'webpack';
import {getPackage} from '../Utils/Package';
import PolyFillList from '../Compile/PolyFillList';
import {
  RUNTIME_TARGET_MAP,
  RUNTIME_EXTERNALS_MAP,
  NODE_RUNTIMES,
  DEFAULT_RUNTIME,
  DEFINITION_USE_MAP,
  BASE_DEFINITIONS,
  PROCESS
} from './Constants';
import ENV_VARS, {
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV
} from '../Constants/Environment';

export const lowerArg = (fn) => (arg = '') => fn(arg.toLowerCase());
export const getTarget = lowerArg(
  (runtime = '') => !!RUNTIME_TARGET_MAP[runtime] ? RUNTIME_TARGET_MAP[runtime] : runtime
);
export const getExternals = lowerArg(
  (runtime = '') => !!RUNTIME_EXTERNALS_MAP[runtime] ? RUNTIME_EXTERNALS_MAP[runtime] : []
);
export const runtimeIsNode = lowerArg(
  (runtime = '') => NODE_RUNTIMES.indexOf(runtime) !== -1
);

const {
  ENV: {
    NODE_ENV
  } = {}
} = ENV_VARS;

export const getConfig = ({
                            inputPaths = [],
                            outputPath = '',
                            runtime = DEFAULT_RUNTIME,
                            moduleAliases = {},
                            base = 'src',
                            library = false
                          } = {}) => {
  const fullBase = !!base ? getFullTargetPath(base) : undefined;
  const entry = inputPaths
    .reduce((entryMap, inputPath) => {
      const relPath = getRelativePath(
        inputPath,
        fullBase
      );
      const dirname = Path.dirname(relPath);
      const extname = Path.extname(relPath);
      const basename = Path.basename(relPath, extname);
      const fullPath = Path.join(dirname, basename);

      entryMap[fullPath] = [
        ...PolyFillList,
        inputPath
      ];

      return entryMap;
    }, {});
  const externals = getExternals(runtime)
    .concat(NodeBuiltins)
    .reduce((externalsMap, moduleName) => {
      externalsMap[moduleName] = moduleName;

      return externalsMap;
    }, {});
  const target = getTarget(runtime);
  const nodeConfig = runtimeIsNode(runtime) ? {
    __filename: false,
    __dirname: false
  } : undefined;
  const {
    name: packageName = ''
  } = getPackage();
  const mappedDefinitions = DEFINITION_USE_MAP[target];
  const useDefinitions = !!mappedDefinitions ? mappedDefinitions : BASE_DEFINITIONS;

  return {
    mode: NODE_ENV === PRODUCTION_NODE_ENV ? PRODUCTION_NODE_ENV : DEVELOPMENT_NODE_ENV,
    entry,
    externals: [
      externals,
      ...(library ? [(context, request, callback) => {
        if (context === fullBase && request.indexOf('.') === 0) {
          const newReqName = request.replace(/\.jsx$/, '.js');

          return callback(null, {
            umd: newReqName,
            amd: newReqName,
            commonjs: newReqName,
            commonjs2: newReqName
          });
        }

        callback();
      }] : [])
    ],

    context: fullBase,
    output: {
      path: outputPath,
      filename: '[name].js',
      library: [packageName, '[name]'],
      libraryTarget: 'umd',
      libraryExport: library ? undefined : 'default',
      publicPath: '/'
    },

    target,
    node: nodeConfig,

    module: {
      rules: [
        {
          test: /\.jsx$/,
          exclude: [],
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: BabelConfig
            }
          ]
        }
      ]
    },

    resolve: {
      alias: moduleAliases,
      extensions: ['.js', '.jsx', '.json']
    },

    optimization: {
      minimize: PROCESS.env.IS.hasOwnProperty(PRODUCTION_NODE_ENV) &&
        !!PROCESS.env.IS[PRODUCTION_NODE_ENV]
    },

    plugins: [
      new WebPack.DefinePlugin(useDefinitions)
    ],

    devtool: 'source-map'
  };
};

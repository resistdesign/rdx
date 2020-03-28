import Path from 'path';
import NodeBuiltins from 'builtin-modules';
import BabelConfig from 'resistdesign-babel-config';
import Env from './Env';
import { getFullTargetPath, getRelativePath } from './Path';
import WebPack from 'webpack';
import { getPackage } from './Package';
import PolyFillList from '../Compile/PolyFillList';

const {
  PRODUCTION_NODE_ENV,
  DEVELOPMENT_NODE_ENV,
  ENV: PROCESS_ENV,
  ENV: {
    NODE_ENV = ''
  } = {}
} = Env;
const PROCESS = {
  env: {
    ...PROCESS_ENV,
    NODE_ENV: process.env && process.env.NODE_ENV,
    DEBUG: process.env && process.env.DEBUG,
    IS: {
      [NODE_ENV]: true
    }
  }
};
const BASE_DEFINITIONS = {
  'process.env.NODE_ENV': JSON.stringify(PROCESS.env.NODE_ENV),
  'process.env.DEBUG': JSON.stringify(PROCESS.env.DEBUG),
  [`process.env.IS.${NODE_ENV}`]: JSON.stringify(PROCESS.env.IS[NODE_ENV]),
  'process.env.IS': JSON.stringify(PROCESS.env.IS)
};
const WEB_DEFINITIONS = {
  ...BASE_DEFINITIONS,
  'process.env': JSON.stringify(PROCESS.env),
  'process': JSON.stringify(PROCESS)
};

export const RUNTIMES = {
  ASYNC_NODE: 'async-node',
  NODE: 'node',
  NODE_WEBKIT: 'node-webkit',
  AWS_LAMBDA: 'aws-lambda',
  ELECTRON_MAIN: 'electron-main',
  ELECTRON_RENDERER: 'electron-renderer',
  WEB: 'web',
  WEBWORKER: 'webworker'
};

const DEFINITION_USE_MAP = {
  [RUNTIMES.WEB]: WEB_DEFINITIONS,
  [RUNTIMES.WEBWORKER]: WEB_DEFINITIONS
};

export const DEFAULT_RUNTIME = RUNTIMES.NODE;

const RUNTIME_TARGET_MAP = {
  [RUNTIMES.AWS_LAMBDA]: 'node'
};
const NODE_RUNTIMES = [
  RUNTIMES.ASYNC_NODE,
  RUNTIMES.NODE,
  RUNTIMES.NODE_WEBKIT,
  RUNTIMES.AWS_LAMBDA,
  RUNTIMES.ELECTRON_MAIN,
  RUNTIMES.ELECTRON_RENDERER
];
const RUNTIME_EXTERNALS_MAP = {
  [RUNTIMES.AWS_LAMBDA]: ['aws-sdk']
};
const lowerArg = (fn) => (arg = '') => fn(arg.toLowerCase());
const getTarget = lowerArg(
  (runtime = '') => !!RUNTIME_TARGET_MAP[runtime] ? RUNTIME_TARGET_MAP[runtime] : runtime
);
const getExternals = lowerArg(
  (runtime = '') => !!RUNTIME_EXTERNALS_MAP[runtime] ? RUNTIME_EXTERNALS_MAP[runtime] : []
);
const runtimeIsNode = lowerArg(
  (runtime = '') => NODE_RUNTIMES.indexOf(runtime) !== -1
);

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
      minimize: !!PROCESS.env.IS[PRODUCTION_NODE_ENV]
    },

    plugins: [
      new WebPack.DefinePlugin(useDefinitions)
    ],

    devtool: 'source-map'
  };
};

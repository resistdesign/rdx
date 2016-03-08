import WebPack from 'webpack';
import ExtractTextPlugin from  'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default class WebPackConfigBuilder {
  static CONFIG_TYPES = {
    SERVE: 'SERVE',
    COMPILE: 'COMPILE'
  };

  static PLUGINS = {
    SERVE: [
      new WebPack.HotModuleReplacementPlugin(),
      new WebPack.NoErrorsPlugin()
    ],
    COMPILE: [
      new WebPack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      new WebPack.optimize.UglifyJsPlugin(),
      new ExtractTextPlugin('[name].[hash].css')// TODO: Needs to be hashed and named per app. Will this work???
    ],
    COMMON: [
      new WebPack.optimize.OccurenceOrderPlugin(),
      // TODO: Is this needed??? new WebPack.DefinePlugin(RuntimeGlobals),
      new HtmlWebpackPlugin({
        template: 'app/index.html???',// TODO: How to configure this???
        hash: true,
        filename: 'index.html???',// TODO: How to configure this???
        minify: false,
        inject: 'body'// TODO: Is this right???
      }),
      new WebPack.optimize.DedupePlugin()
    ]
  };

  static LOADERS = {
    jsHot: {// Serve
      TYPE: WebPackConfigBuilder.CONFIG_TYPES.SERVE,
      test: /\.(js|jsx)$/,
      loader: require.resolve('react-hot-loader') + '!' + require.resolve('babel-loader') + '?stage=0',
      include: packageRoot
    },
    js: {// Compile
      TYPE: WebPackConfigBuilder.CONFIG_TYPES.COMPILE,
      test: /\.(js|jsx)$/,
      loader: require.resolve('babel-loader') + '?stage=0',
      include: packageRoot
    },

    json: {
      test: /\.json$/,
      loader: require.resolve('json-loader')
    },
    // TODO: `.less` loader.
    style: {// Serve
      TYPE: WebPackConfigBuilder.CONFIG_TYPES.SERVE,
      test: /\.css$/,
      loader: require.resolve('style-loader')
    },
    less: {
      test: /\.less$/,
      loader: require.resolve('less-loader')
    },
    extractCss: {// Compile
      TYPE: WebPackConfigBuilder.CONFIG_TYPES.COMPILE,
      test: /\.css$/,
      loader: ExtractTextPlugin.extract(require.resolve('css-loader') + '?safe')
    },
    css: {// Serve
      TYPE: WebPackConfigBuilder.CONFIG_TYPES.SERVE,
      test: /\.css$/,
      loader: require.resolve('css-loader') + '?safe'
    },
    postCss: {
      test: /\.css$/,
      loader: require.resolve('postcss-loader')
    },

    image: {
      test: /\.(png|jpg|svg)$/,
      loader: require.resolve('url-loader') + '?limit=8192'
    },

    woff: {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: require.resolve('url-loader') + '?limit=10000&mimetype=application/font-woff'
    },
    ttf: {
      test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('url-loader') + '?limit=10000&mimetype=application/octet-stream'
    },
    eot: {
      test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('file-loader')
    },
    svg: {
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('url-loader') + '?limit=10000&mimetype=image/svg+xml'
    },
    otf: {
      test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
      loader: require.resolve('url-loader') + '?limit=10000&mimetype=font/opentype'
    }
  };

  static getBaseConfig(type = WebPackConfigBuilder.CONFIG_TYPES.COMPILE) {
    const newConfig = {
      plugins: [
        ...(type === WebPackConfigBuilder.CONFIG_TYPES.SERVE ?
          WebPackConfigBuilder.PLUGINS.SERVE : WebPackConfigBuilder.CONFIG_TYPES.COMPILE),
        ...WebPackConfigBuilder.PLUGINS.COMMON
      ],
      module: {
        loaders: []
      }
    };

    for (let k in WebPackConfigBuilder.LOADERS) {
      const loader = WebPackConfigBuilder.LOADERS[k];
      const loaderType = loader.TYPE;
      const newLoader = {...loader};

      delete loader.TYPE;

      if (typeof loaderType === 'undefined' || loaderType === type) {
        newConfig.module.loaders.push(newLoader);
      }
    }

    return newConfig;
  }
}
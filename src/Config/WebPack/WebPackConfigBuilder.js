import Path from 'path';
import WebPack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebPackPlugin from 'clean-webpack-plugin';

const CONFIG_TYPES = {
  SERVE: 'SERVE',
  COMPILE: 'COMPILE'
};

export default class WebPackConfigBuilder {
  static CONFIG_TYPES = CONFIG_TYPES;

  static getBaseConfig(type = CONFIG_TYPES.COMPILE, outputPath) {
    const extractHtml = new ExtractTextPlugin('[name]');
    const PLUGINS = {
      SERVE: [
        new WebPack.HotModuleReplacementPlugin(),
        new WebPack.NoErrorsPlugin()
      ],
      COMPILE: [
        new WebPack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new WebPack.optimize.UglifyJsPlugin(),
        new CleanWebPackPlugin(
          [outputPath],
          {
            root: Path.resolve('./'),
            verbose: false
          }
        )
      ],
      COMMON: [
        new WebPack.optimize.OccurenceOrderPlugin(),
        new WebPack.optimize.DedupePlugin(),
        extractHtml
      ]
    };
    const LOADERS = {
      jsHot: {// Serve
        TYPE: CONFIG_TYPES.SERVE,
        test: /\.(js|jsx)$/,
        loader: require.resolve('react-hot-loader') + '!' + require.resolve('babel-loader') + '?stage=0'
      },
      js: {// Compile
        TYPE: CONFIG_TYPES.COMPILE,
        test: /\.(js|jsx)$/,
        loader: require.resolve('babel-loader') + '?stage=0'
      },
      appJs: {
        test: /\.app\.js$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]` +
        '!' +
        require.resolve('babel-loader') + '?stage=0'
      },

      json: {
        test: /\.json$/,
        loader: require.resolve('json-loader')
      },

      style: {// Serve
        TYPE: CONFIG_TYPES.SERVE,
        test: /\.css$/,
        loader: require.resolve('style-loader')
      },
      less: {
        test: /\.less$/,
        loader: require.resolve('less-loader')
      },
      css: {
        test: /\.css$/,
        loader: require.resolve('css-loader') + '?safe'
      },
      appCSS: {
        test: /\.app\.css$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]` +
        '!' +
        require.resolve('css-loader') + '?safe'
      },
      postCss: {
        test: /\.css$/,
        loader: require.resolve('postcss-loader')
      },

      image: {
        test: /\.(png|jpg|jpeg|gif|ico)$/,// See `svg` below.
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]`
      },

      woff: {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]`
      },
      ttf: {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]`
      },
      eot: {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]`
      },
      svg: {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]`
      },
      otf: {
        test: /\.otf(\?v=\d+\.\d+\.\d+)?$/,
        loader: `${require.resolve('file-loader')}?context=./src&name=[path][name].[hash].[ext]`
      },

      html: {
        test: /\.(html)$/,
        loader: extractHtml.extract(
          require.resolve('html-loader') + '?' + JSON.stringify({
            attrs: ['img:src', 'link:href', 'script:src'],
            minimize: false,
            removeAttributeQuotes: false,
            caseSensitive: true
          })
        )
      }
    };
    const newConfig = {
      plugins: [
        ...(type === CONFIG_TYPES.SERVE ?
          PLUGINS.SERVE : PLUGINS.COMPILE),
        ...PLUGINS.COMMON
      ],
      module: {
        loaders: []
      }
    };

    for (let k in LOADERS) {
      const loader = LOADERS[k];
      const newLoader = { ...loader };

      delete newLoader.TYPE;

      if (typeof loader.TYPE === 'undefined' || loader.TYPE === type) {
        newConfig.module.loaders.push(newLoader);
      }
    }

    return newConfig;
  }
}
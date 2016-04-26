import Path from 'path';
import WebPack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebPackPlugin from 'clean-webpack-plugin';
import LoadMultiConfig from './Utils/LoadMultiConfig';

const COMMON_TYPE = 'Common';

export default class WebPackConfigBuilder {
  static getBaseConfig(contextPath, outputPath, serve = false) {
    const fileLoaderPathPrefix = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[hash]`;
    const type = serve ? 'Serve' : 'Compile';
    const baseConfigPath = __dirname;

    const pluginTypePath = Path.join(baseConfigPath, 'Plugins', type);
    const pluginCommonPath = Path.join(baseConfigPath, 'Plugins', COMMON_TYPE);
    const loadersTypePath = Path.join(baseConfigPath, 'Loaders', type);
    const loadersCommonPath = Path.join(baseConfigPath, 'Loaders', COMMON_TYPE);
    const otherTypePath = Path.join(baseConfigPath, 'Other', type);
    const otherCommonPath = Path.join(baseConfigPath, 'Other', COMMON_TYPE);

    const typePlugins = LoadMultiConfig(pluginTypePath, contextPath, outputPath);
    const commonPlugins = LoadMultiConfig(pluginCommonPath, contextPath, outputPath);
    const typeLoaders = LoadMultiConfig(loadersTypePath, contextPath, outputPath);
    const commonLoaders = LoadMultiConfig(loadersCommonPath, contextPath, outputPath);
    const typeOther = LoadMultiConfig(otherTypePath, contextPath, outputPath, true);
    const commonOther = LoadMultiConfig(otherCommonPath, contextPath, outputPath, true);

    const extractCss = new ExtractTextPlugin('[name].[hash].css');
    const extractHtml = new ExtractTextPlugin('[name]');

    const commonConfigProps = {
      target: 'web',
      resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
      }
    };

    const HTML_ASSET_CONFIG = {
      output: {
        context: contextPath,
        path: Path.resolve(outputPath)
      },
      plugins: {
        ...(typePlugins || []),
        ...(commonPlugins || [])
      },
      module: {
        loaders: [
          ...(typeLoaders || []),
          ...(commonLoaders || [])
        ]
      },
      ...commonConfigProps,
      ...typeOther,
      ...commonOther
    };

    return {
      plugins: [
        ...(serve ? [
          new WebPack.HotModuleReplacementPlugin(),
          new WebPack.NoErrorsPlugin()
        ] : []),
        new CleanWebPackPlugin(
          [outputPath],
          {
            root: Path.resolve('./'),
            verbose: false
          }
        ),
        new WebPack.optimize.OccurenceOrderPlugin(),
        new WebPack.optimize.DedupePlugin(),
        extractCss,
        extractHtml,
        {
          apply: function (compiler) {
            HTML_ASSET_CONFIG.parentCompiler = compiler;
          }
        }
      ],
      module: {
        loaders: [
          {
            test: /\.(html)$/,
            loader: extractHtml.extract(
              require.resolve('html-loader') + '?' + JSON.stringify({
                attrs: ['img:src', 'link:href', 'script:src'],
                minimize: false,
                removeAttributeQuotes: false,
                caseSensitive: true
              })
            )
          },
          {
            test: /\.(woff|woff2|ttf|eot|otf)($|\?v=\d+\.\d+\.\d+$)/,
            loader: `${fileLoaderPathPrefix}.[ext]`
          },
          {
            test: /\.(png|jpg|jpeg|gif|ico|svg)($|\?.*$)/,
            loader: `${fileLoaderPathPrefix}.[ext]`
          },
          {
            test: /\.(css|less)$/,
            loader: require.resolve('css-loader') +
            '!' +
            require.resolve('less-loader') +
            '!' +
            require.resolve('postcss-loader')
          },
          {
            test: /\.(css|less)\?file$/,
            loader: `${fileLoaderPathPrefix}.css` +
            '!' +
            extractCss.extract(
              require.resolve('css-loader') +
              '!' +
              require.resolve('less-loader') +
              '!' +
              require.resolve('postcss-loader')
            )
          },
          {
            test: /\.(js|jsx)($|\?.*$)/,
            loader: require.resolve('../../CustomLoaders/HTMLAsset')
          }
        ]
      },
      postcss: commonOther.postcss,
      htmlAsset: HTML_ASSET_CONFIG,
      ...commonConfigProps
    };
  }
}

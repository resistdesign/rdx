import Path from 'path';
import WebPack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebPackPlugin from 'clean-webpack-plugin';
import LoadMultiConfig from './Utils/LoadMultiConfig';

const COMMON_TYPE = 'Common';

export default class WebPackConfigBuilder {
  static getBaseConfig(contextPath, outputPath, serve = false) {
    const type = serve ? 'Serve' : 'Compile';
    const baseConfigPath = __dirname;

    const pluginTypePath = Path.join(baseConfigPath, 'Plugins', type);
    const pluginCommonPath = Path.join(baseConfigPath, 'Plugins', COMMON_TYPE);
    const loadersTypePath = Path.join(baseConfigPath, 'Plugins', type);
    const loadersCommonPath = Path.join(baseConfigPath, 'Plugins', COMMON_TYPE);
    const otherTypePath = Path.join(baseConfigPath, 'Plugins', type);
    const otherCommonPath = Path.join(baseConfigPath, 'Plugins', COMMON_TYPE);

    const typePlugins = LoadMultiConfig(pluginTypePath, contextPath, outputPath);
    const commonPlugins = LoadMultiConfig(pluginCommonPath, contextPath, outputPath);
    const typeLoaders = LoadMultiConfig(loadersTypePath, contextPath, outputPath);
    const commonLoaders = LoadMultiConfig(loadersCommonPath, contextPath, outputPath);
    const typeOther = LoadMultiConfig(otherTypePath, contextPath, outputPath, true);
    const commonOther = LoadMultiConfig(otherCommonPath, contextPath, outputPath, true);

    const extractHtml = new ExtractTextPlugin('[name]');

    const commonConfigProps = {
      target: 'web',
      resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
      }
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
        extractHtml
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
            test: /\.(js|jsx|css|less|png|jpg|jpeg|gif|ico|svg)$/,
            loader: require.resolve('../../CustomLoaders/HTMLAsset')
          }
        ]
      },
      htmlAsset: {
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
      },
      ...commonConfigProps
    };
  }
}

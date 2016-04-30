import Path from 'path';
import WebPack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebPackPlugin from 'clean-webpack-plugin';
import LoadMultiConfig from './Utils/LoadMultiConfig';

const COMMON_TYPE = 'Common';

export default class WebPackConfigBuilder {
  static getBaseConfig(htmlFilePath, contextPath, outputPath, serve = false) {
    const htmlContextPath = Path.dirname(htmlFilePath);
    const extractCSSPath = Path.join(
      Path.relative(contextPath, htmlContextPath),
      '[name].css?[hash]'
    );
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

    const extractCss = new ExtractTextPlugin(`${extractCSSPath}?[hash]`);

    return {
      target: 'web',
      resolve: {
        extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
      },
      // TODO: HTML Files needs to be written on completion.
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
        ...(typePlugins || []),
        ...(commonPlugins || []),
        extractCss
      ],
      module: {
        loaders: [
          {
            test: /\.(less|css)$/,
            loader: extractCss.extract([
              require.resolve('css-loader'),
              require.resolve('less-loader'),
              require.resolve('postcss-loader')
            ])
          },
          ...(typeLoaders || []),
          ...(commonLoaders || [])
        ]
      },
      ...typeOther,
      ...commonOther
    };
  }
}

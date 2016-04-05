import Path from 'path';
import WebPack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import CleanWebPackPlugin from 'clean-webpack-plugin';

export default class WebPackConfigBuilder {
  static getBaseConfig(contextPath, outputPath, serve = false) {
    const extractHtml = new ExtractTextPlugin('[name]');
    const newConfig = {
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
          // TODO: Get plugins.
        },
        module: {
          loaders: [
            // TODO: Get loaders.
          ]
        }
        // TODO: Get other.
      }
    };

    return newConfig;
  }
}
import WebPackConfigBuilder from './WebPackConfigBuilder';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function (entries = {}, outputPath = 'root') {
  const baseConfig = WebPackConfigBuilder.getBaseConfig(WebPackConfigBuilder.CONFIG_TYPES.COMPILE);
  const entryMap = {};
  const htmlPlugins = [];

  for (let k in entries) {
    if (entries.hasOwnProperty(k)) {
      const entry = entries[k];
      // TODO: Need chunks (full??? js paths per html file).
      // TODO: Need html files.
      // TODO: Need js files (full??? paths).
      htmlPlugins.push(new HtmlWebpackPlugin({
        template: 'app/index.html???',// TODO: How to configure this???
        hash: true,
        filename: '[name].html???',// TODO: How to configure this???
        minify: false,
        inject: 'body'// TODO: Is this right???
      }));
    }
  }

  return {
    entry: entryMap,
    output: {
      path: outputPath,
      filename: '[name].[hash].js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    plugins: [...(baseConfig.plugins || []), ...(htmlPlugins || [])],
    loaders: baseConfig.loaders
  };
};

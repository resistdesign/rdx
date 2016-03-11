import WebPackConfigBuilder from './WebPackConfigBuilder';

export default function (entries = {}, outputPath = 'root') {
  const baseConfig = WebPackConfigBuilder.getBaseConfig(WebPackConfigBuilder.CONFIG_TYPES.COMPILE);

  return {
    entry: entries,
    output: {
      path: outputPath,
      filename: '[name].[hash].js',
      publicPath: '/'
    },
    resolve: {
      extensions: ['', '.js', '.jsx']
    },
    ...baseConfig
  };
};

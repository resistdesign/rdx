import Path from 'path';
import WebPackConfigBuilder from './WebPackConfigBuilder';

export default function (entries = {}, outputPath = 'root') {
  const baseConfig = WebPackConfigBuilder
    .getBaseConfig(
      WebPackConfigBuilder.CONFIG_TYPES.COMPILE,
      outputPath
    );

  return {
    entry: entries,
    output: {
      path: Path.resolve(outputPath),
      publicPath: '/'
    },
    target: 'web',
    resolve: {
      extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
    },
    ...baseConfig
  };
};

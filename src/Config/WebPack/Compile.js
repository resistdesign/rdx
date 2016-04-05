import Path from 'path';
import WebPackConfigBuilder from './WebPackConfigBuilder';

export default function (entries = {}, contextPath = './src', outputPath = './public') {
  const baseConfig = WebPackConfigBuilder
    .getBaseConfig(
      contextPath,
      outputPath
    );

  return {
    entry: entries,
    output: {
      path: Path.resolve(outputPath),
      filename: '.[name].[hash]',
      publicPath: '/'
    },
    ...baseConfig
  };
};

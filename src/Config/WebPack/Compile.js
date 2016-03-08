import Path from 'path';
import WebPackConfigBuilder from './WebPackConfigBuilder';

export default {
  entry: '???',// TODO: Probably not set here.
  output: {
    path: '???',// TODO: Probably not set here.
    filename: '[name].[hash].js',// TODO: use [hash]. Will this work?
    publicPath: '/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  ...WebPackConfigBuilder.getBaseConfig(WebPackConfigBuilder.CONFIG_TYPES.COMPILE)
};

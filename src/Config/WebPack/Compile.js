import WebPackConfigBuilder from './WebPackConfigBuilder';

export default {
  entry: '???',// TODO: Probably not set here.
  output: {
    path: '???',// TODO: Probably not set here.
    filename: '[name].[hash].js',// TODO: use [hash]. Will this work?
    publicPath: PUBLIC_URL// TODO: How to set PUBLIC_URL???
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  ...WebPackConfigBuilder.getBaseConfig(WebPackConfigBuilder.CONFIG_TYPES.COMPILE)
};

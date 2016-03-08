import WebPackConfigBuilder from './WebPackConfigBuilder';

export default {
  devtool: 'cheap-module-eval-source-map',
  entry: [
    require.resolve('webpack-dev-server/client') + '?' + PUBLIC_URL,// TODO: How to set PUBLIC_URL???
    require.resolve('webpack/hot/only-dev-server'),
    webpackEntryPath// TODO: How to set webpackEntryPath???
  ],
  output: {
    path: dirPath,
    publicPath: PUBLIC_URL,// TODO: How to set PUBLIC_URL???
    filename: '[name].[hash].js',// TODO: Will this work???
    devtoolModuleFilenameTemplate: '[absolute-resource-path]'// TODO: What is this???
  },
  ...WebPackConfigBuilder.getBaseConfig(WebPackConfigBuilder.CONFIG_TYPES.SERVE)
};
// TODO: How to setup Proxying the right way???

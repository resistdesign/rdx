import WebPack from 'webpack';

export default function (contextPath, outputPath) {
  return [
    new WebPack.HotModuleReplacementPlugin(),
    new WebPack.NoErrorsPlugin()
  ];
}

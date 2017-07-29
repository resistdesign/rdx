import WebPack from 'webpack';

export default function () {
  return [
    new WebPack.HotModuleReplacementPlugin(),
    new WebPack.NoErrorsPlugin()
  ];
}

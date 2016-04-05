import WebPack from 'webpack';

export default function (contextPath, outputPath) {
  return [
    new WebPack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ];
}

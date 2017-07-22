import WebPack from 'webpack';

export default function (contextPath, outputPath) {
  return [
    new WebPack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env && process.env.NODE_ENV,
        DEBUG: process.env && process.env.DEBUG
      })
    })
  ];
}

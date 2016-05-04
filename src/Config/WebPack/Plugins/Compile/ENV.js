import WebPack from 'webpack';

export default function (contextPath, outputPath) {
  return [
    new WebPack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    })
  ];
}

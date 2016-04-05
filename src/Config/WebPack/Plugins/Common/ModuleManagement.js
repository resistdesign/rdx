import WebPack from 'webpack';

export default function (contextPath, outputPath) {
  return [
    new WebPack.optimize.OccurenceOrderPlugin(),
    new WebPack.optimize.DedupePlugin()
  ];
}

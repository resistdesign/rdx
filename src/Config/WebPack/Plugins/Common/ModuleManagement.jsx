import WebPack from 'webpack';

export default function () {
  return [
    new WebPack.optimize.OccurenceOrderPlugin(),
    new WebPack.optimize.DedupePlugin()
  ];
}

import WebPack from 'webpack';

export default function (contextPath, outputPath) {
  return [
    new WebPack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false,
      test: /\.(js|jsx)$/
    })
  ];
}

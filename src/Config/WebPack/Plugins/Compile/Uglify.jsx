import WebPack from 'webpack';

export default function () {
  return process.env.NODE_ENV === 'production' ?
  [
    new WebPack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false,
      test: /\.(js|jsx)$/
    })
  ] : [];
}

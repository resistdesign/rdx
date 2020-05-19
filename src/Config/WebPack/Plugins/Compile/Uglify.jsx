import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

export default function () {
  return process.env.NODE_ENV === 'production' ?
  [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: false,
      test: /\.(js|jsx)$/
    })
  ] : [];
}

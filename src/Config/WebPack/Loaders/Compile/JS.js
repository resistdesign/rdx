export default function (contextPath, outputPath) {
  return [
    {
      test: /\.(js|jsx)$/,
      loader: `${require.resolve('babel-loader')}?stage=0`
    }
  ];
}

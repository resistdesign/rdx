export default function (contextPath, outputPath) {
  return [
    {
      test: /\.json$/,
      loader: require.resolve('json-loader')
    }
  ];
}

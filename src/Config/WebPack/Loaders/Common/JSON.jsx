export default function (contextPath, outputPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[ext]?[hash]`;
  const manifestJsonTest = /(^|\/)manifest\.json$/;
  return [
    {
      test: /\.json$/,
      exclude: manifestJsonTest,
      loader: require.resolve('json-loader')
    },
    {
      test: manifestJsonTest,
      loader: fileLoaderPath
    }
  ];
}

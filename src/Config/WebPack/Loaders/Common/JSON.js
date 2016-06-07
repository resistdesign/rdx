export default function (contextPath, outputPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[ext]?[hash]`;
  return [
    {
      test: /\.json$/,
      loader: require.resolve('json-loader')
    },
    {
      test: /(^|\/)manifest\.json$/,
      loader: fileLoaderPath
    }
  ];
}

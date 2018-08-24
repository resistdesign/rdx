export default function (contextPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[ext]?[hash]`;

  return [
    {
      test: /\.php$/,
      loader: fileLoaderPath
    }
  ];
}

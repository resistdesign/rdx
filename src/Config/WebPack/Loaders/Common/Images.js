export default function (contextPath, outputPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[ext]?[hash]`;
  return [
    {
      test: /\.(png|jpg|jpeg|gif|ico|svg)($|\?v=\d+\.\d+\.\d+$)/,
      loader: fileLoaderPath
    }
  ];
}

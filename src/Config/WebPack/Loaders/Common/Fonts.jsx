export default function (contextPath, outputPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[ext]?[hash]`;
  return [
    {
      test: /\.(woff|woff2|ttf|eot|otf)($|\?v=\d+\.\d+\.\d+$)/,
      loader: fileLoaderPath
    }
  ];
}

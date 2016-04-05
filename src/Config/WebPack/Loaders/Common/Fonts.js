export default function (contextPath, outputPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[hash].[ext]`;
  return [
    {
      test: /\.(woff(2)|ttf|eot|svg|otf)(\?v=\d+\.\d+\.\d+)$/,
      loader: fileLoaderPath
    }
  ];
}

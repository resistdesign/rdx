export default function (contextPath) {
  const fileLoaderPath = `${require.resolve('file-loader')}?context=${contextPath}&name=[path][name].[ext]?[hash]`;
  return [
    {
      test: /\.(webp|png|jpg|jpeg|gif|ico|svg)($|\?v=\d+\.\d+\.\d+$)/,
      exclude: [
        /\.jsx\.svg($|\?v=\d+\.\d+\.\d+$)/
      ],
      loader: fileLoaderPath
    }
  ];
}

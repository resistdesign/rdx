export default function (contextPath, outputPath) {
  return [
    {
      test: /\.(less|css)$/,
      loader: require.resolve('css-loader') +
      '!' +
      require.resolve('less-loader') +
      '!' +
      require.resolve('postcss-loader')
    }
  ];
}

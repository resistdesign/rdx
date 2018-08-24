export default function (contextPath) {
  const fileLoaderPath = require.resolve('ignore-loader');

  return [
    {
      test: /\.php$/,
      loader: fileLoaderPath
    }
  ];
}

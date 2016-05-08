import Path from 'path';

export default function (contextPath, outputPath) {
  const inc = new RegExp(Path.join(process.cwd(), contextPath));

  return [
    {
      test: /\.(js|jsx)$/,
      include: [inc],
      loader: require.resolve('react-hot-loader') + '!' + require.resolve('babel-loader') + '?stage=0'
    }
  ];
}

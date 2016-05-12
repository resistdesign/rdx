import Path from 'path';

export default function (contextPath, outputPath) {
  return [
    {
      test: /\.(js|jsx)$/,
      include: new RegExp(Path.resolve(process.cwd(), contextPath)),
      loader: [
        require.resolve('react-hot-loader'),
        `${require.resolve('babel-loader')}?stage=0`
      ].join('!')
    },
    {
      test: /\.(js|jsx)$/,
      exclude: new RegExp(Path.resolve(process.cwd(), contextPath)),
      loader: `${require.resolve('babel-loader')}?stage=0`
    }
  ];
}

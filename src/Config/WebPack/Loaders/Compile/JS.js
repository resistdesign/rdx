import BabelOptions from '../../Constants/BabelOptions';

export default function (contextPath, outputPath) {
  return [
    {
      test: /\.(js|jsx)$/,
      loader: `${require.resolve('babel-loader')}?${BabelOptions}`
    }
  ];
}

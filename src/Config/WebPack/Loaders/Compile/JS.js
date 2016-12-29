import BabelOptions from '../../Constants/BabelOptions';
import BabelExcludes from '../../Constants/BabelExcludes';

export default function (contextPath, outputPath) {
  return [
    {
      test: /\.(js|jsx)$/,
      exclude: [
        ...BabelExcludes
      ],
      loader: `${require.resolve('babel-loader')}?${JSON.stringify(BabelOptions)}`
    }
  ];
}

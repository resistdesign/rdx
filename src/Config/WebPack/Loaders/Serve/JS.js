import Path from 'path';
import BabelOptions from '../../Constants/BabelOptions';
import BabelExcludes from '../../Constants/BabelExcludes';

export default function (contextPath, outputPath) {
  return [
    {
      test: /\.(js|jsx)$/,
      include: new RegExp(Path.resolve(process.cwd(), contextPath)),
      loader: [
        require.resolve('react-hot-loader'),
        `${require.resolve('babel-loader')}?${JSON.stringify(BabelOptions)}`
      ].join('!')
    },
    {
      test: /\.(js|jsx)$/,
      exclude: [
        new RegExp(Path.resolve(process.cwd(), contextPath)),
        ...BabelExcludes
      ],
      loader: `${require.resolve('babel-loader')}?${JSON.stringify(BabelOptions)}`
    }
  ];
}

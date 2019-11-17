import BabelOptions from '../../Constants/BabelOptions';

export default function () {
  return [
    {
      test: /\.jsx\.svg($|\?v=\d+\.\d+\.\d+$)/,
      loader: [
        `${require.resolve('babel-loader')}?${JSON.stringify(BabelOptions)}`,
        require.resolve('../../Utils/CustomLoaders/AI_SVG_2_JSX'),
        `${require.resolve('svg-react-loader')}?${JSON.stringify({ raw: true })}`
      ].join('!')
    }
  ];
}

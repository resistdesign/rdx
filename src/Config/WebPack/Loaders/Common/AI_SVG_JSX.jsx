export default function () {
  return [
    {
      test: /\.jsx\.svg($|\?v=\d+\.\d+\.\d+$)/,
      loader: [
        require.resolve('svg-react-loader'),
        require.resolve('../../Utils/CustomLoaders/AI_SVG_2_JSX')
      ].join('!')
    }
  ];
}

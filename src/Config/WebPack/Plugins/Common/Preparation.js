import CleanWebPackPlugin from 'clean-webpack-plugin';

export default function (contextPath, outputPath) {
  return [
    new CleanWebPackPlugin(
      [outputPath],
      {
        root: Path.resolve('./'),
        verbose: false
      }
    )
  ];
}

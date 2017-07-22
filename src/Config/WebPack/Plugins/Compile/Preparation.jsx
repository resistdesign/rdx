import Path from 'path';
import CleanWebPackPlugin from 'clean-webpack-plugin';

export default function (contextPath, outputPath) {
  const root = Path.resolve('./');
  const relativeOutputPath = Path.relative(root, outputPath);
  return [
    new CleanWebPackPlugin(
      [relativeOutputPath],
      {
        root,
        verbose: false
      }
    )
  ];
}

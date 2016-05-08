import Path from 'path';

export default function (contextPath, outputPath) {
  return {
    resolve: {
      alias: {
        'react': Path.join(process.cwd(), 'node_modules', 'react'),
        'react-hot-loader': require.resolve('react-hot-loader')
      },
      extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
    }
  };
}

import Path from 'path';

export default function (contextPath, outputPath) {
  return {
    resolve: {
      alias: {
        'react': Path.join(process.cwd(), 'node_modules', 'react')
      },
      fallback: [
        Path.resolve(__dirname, '..', '..', '..', '..', '..', 'node_modules')
      ],
      extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
    }
  };
}

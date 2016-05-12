import Path from 'path';

export default function (contextPath, outputPath) {
  return {
    resolve: {
      alias: {
        'react': Path.join(process.cwd(), 'node_modules', 'react')
      },
      extensions: ['', '.js', '.jsx', '.json', '.html', '.css', '.less']
    }
  };
}

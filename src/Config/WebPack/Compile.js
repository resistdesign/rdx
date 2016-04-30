import Path from 'path';
import FS from 'fs';
import WebPackConfigBuilder from './WebPackConfigBuilder';
import HTMLEntrypoint from './Utils/HTMLEntrypoint';

export default function (htmlFilePath, contextPath = './src', outputPath = './public') {
  const htmlEntry = new HTMLEntrypoint(FS.readFileSync(htmlFilePath, { encoding: 'utf8' }));
  const htmlEntryMap = htmlEntry.getEntrypoints();
  const entry = {};
  const htmlContextPath = Path.dirname(htmlFilePath);
  const baseConfig = WebPackConfigBuilder
    .getBaseConfig(
      htmlFilePath,
      contextPath,
      outputPath
    );

  for (const k in htmlEntryMap) {
    if (htmlEntryMap.hasOwnProperty(k)) {
      entry[k] = Path.resolve(Path.join(htmlContextPath, htmlEntryMap[k]));
    }
  }

  return {
    // TODO: Paths extracted from HTML are relative to the HTML file.
    // TODO: They must be made relative to the CWD and then to `src`.
    entry,
    output: {
      path: Path.resolve(outputPath),
      filename: Path.join(
        Path.relative(contextPath, htmlContextPath),
        '[name]'
      ),
      publicPath: '/'
    },
    ...baseConfig
  };
};

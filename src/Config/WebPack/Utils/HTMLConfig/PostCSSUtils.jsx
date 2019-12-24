import Path from 'path';

export const POST_CSS_CONFIG_FILE_NAMES = [
  '.postcssrc',
  '.postcssrc.json',
  '.postcssrc.yml',
  '.postcssrc.js',
  'postcss.config.js'
];

export const postCSSConfigExists = () => {
  for (let i = 0; i < POST_CSS_CONFIG_FILE_NAMES.length - 1; i++) {
    const fileName = POST_CSS_CONFIG_FILE_NAMES[i];
    const fullPath = Path.join(process.cwd(), fileName);

    try {
      if (!!require.resolve(fullPath)) {
        return true;
      }
    } catch (error) {
      // Ignore.
    }
  }

  return false;
};

import Path from 'path';
import Mustache from 'mustache';

const TEMPLATE_DELIMITERS = {
  OPEN: '___',
  CLOSE: '___'
};

export const TEMPLATE_SOURCE_FILE_EXTENSIONS = [
  'xml',
  'jsx',
  'js',
  'html',
  'webmanifest',
  'json'
];

export const isTemplateSource = (ext = '') => TEMPLATE_SOURCE_FILE_EXTENSIONS.indexOf(ext) !== -1;

export const pathIsTemplateSource = (path = '') => isTemplateSource(
  Path.extname(path).replace('.', '')
);

export const interpolateTemplateValues = (template = '', values = {}) => {
  return Mustache.render(
    template,
    values,
    {},
    [
      TEMPLATE_DELIMITERS.OPEN,
      TEMPLATE_DELIMITERS.CLOSE
    ]
  );
};

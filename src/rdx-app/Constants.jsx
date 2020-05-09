import Path from 'path';

export const BASE_TEMPLATE_DIR = Path.join(
  __dirname,
  '..',
  '..',
  'rdx-app-templates',
  'basic'
);

export const DEFAULT_APP_PACKAGE_DEPENDENCIES = [
  'react',
  'react-dom',
  'react-hot-loader',
  'styled-components'
];

export const DEFAULT_APP_PACKAGE_DEV_DEPENDENCIES = [
  'rdx',
  'flow-bin'
];

export const DEFAULT_APP_PACKAGE_SCRIPTS = {
  'dev': 'rdx serve',
  'build': 'rdx compile'
};

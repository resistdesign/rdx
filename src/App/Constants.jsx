import Path from 'path';

export const BASE_TEMPLATE_DIR = Path.join(
  __dirname,
  'Assets'
);

export const DEFAULT_APP_PACKAGE_DEPENDENCIES = [
  'react-dom',
  'react-hot-loader',
  'react',
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

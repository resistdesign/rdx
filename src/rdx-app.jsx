#!/usr/bin/env node

const Path = require('path');
const Glob = require('glob');
const Program = require('commander');
const {
  getMergedOptions,
  getPackage
} = require('./Utils/Package');
const { execCommandInline } = require('./Utils/CommandLine');

/**
 * The App program.
 * @type {Object}
 * */
Program
  .option('-i, --icons', 'Include app icons and metadata.', true)
  .option('-b, --base <directory>', 'The base directory for app files.', 'src')
  .parse(process.argv);

const exec = async () => {
  // Constants
  const ASSET_BASE = Path.join(__dirname, 'App', 'Assets');
  const META_ASSET_BASE = Path.join(ASSET_BASE, 'app-icons');
  const ICON_IMAGE_EXTENSIONS = [
    'ico',
    'png',
    'svg'
  ];
  const TEMPLATE_DELIMITERS = {
    OPEN: '___',
    CLOSE: '___'
  };
  // File paths
  const ASSETS_PATHS = Glob.sync(Path.join(ASSET_BASE, '*.*'));
  // Exec options
  const mergedOptions = getMergedOptions('app', Program);
  const packageInfo = await new Promise(async (res, rej) => {
    let pi;// = getPackage();

    if (!pi) {
      await execCommandInline('npm init');

      pi = getPackage() || {};
    }

    res(pi);
  });
  const {
    description: packageDescription
  } = packageInfo || {};
  const {
    args: [
      appName = 'App',
      appPath = './index.html'
    ] = [],
    icons,
    base
  } = mergedOptions;
  const description = packageDescription || 'A JSX application.';

  if (!!icons) {
    const META_ASSET_PATHS = Glob.sync(Path.join(META_ASSET_BASE, '*.*'));
  }
};

exec()
  .then(() => {
    process.exit();
  });

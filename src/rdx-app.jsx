#!/usr/bin/env node

const Path = require('path');
const Glob = require('glob');
const Program = require('commander');
const Mustache = require('mustache');
const { getMergedOptions } = require('./Utils/Package');

/**
 * The App program.
 * @type {Object}
 * */
Program
  .option('-i, --icons', 'Include app icons and metadata.', true)
  .option('-b, --base <directory>', 'The base directory for app files.', 'src')
  .parse(process.argv);

const exec = () => {
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
  const META_ASSET_PATHS = Glob.sync(Path.join(META_ASSET_BASE, '*.*'));
  // Exec options
  const {} = getMergedOptions('app', Program);
  const templateData = {
    APP_CLASS_NAME: '',
    APP_NAME: '',
    APP_DESCRIPTION: '',
    PUBLIC_ICON_PATH: '',
    SCRIPT: '',
    PUBLIC_APP_PATH: ''
  };
};

exec();

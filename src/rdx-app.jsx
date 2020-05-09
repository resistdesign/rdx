#!/usr/bin/env node

import React from 'react';
import { Command } from 'commander';
import { render } from 'ink';
import InputView, { FIELD_MAP, DEFAULT_VALUES } from './rdx-app/InputView';

/**
 * The App program.
 * @type {Object}
 * */
const Program = new Command();

Program
  .option('-t, --title <value>', FIELD_MAP.title, DEFAULT_VALUES.title)
  .option('-p, --description <value>', FIELD_MAP.description, DEFAULT_VALUES.description)
  .option('-r, --theme-color <value>', FIELD_MAP.themeColor, DEFAULT_VALUES.themeColor)
  .option('-b, --base <directory>', FIELD_MAP.baseDirectory, DEFAULT_VALUES.baseDirectory)
  .option('-i, --icons', FIELD_MAP.includeIcons, DEFAULT_VALUES.includeIcons)
  .option('-d, --default', FIELD_MAP.isDefaultApp, DEFAULT_VALUES.isDefaultApp)
  .option('-o, --overwrite', FIELD_MAP.overwrite, DEFAULT_VALUES.overwrite)
  .parse(process.argv);

const {
  title,
  description,
  themeColor,
  base: baseDirectory,
  icons: includeIcons,
  default: isDefaultApp,
  overwrite
} = Program.opts();
const CAPTURED_APP_FORM_INPUT = {
  title,
  description,
  themeColor,
  baseDirectory,
  includeIcons,
  isDefaultApp,
  overwrite
};

render(
  <InputView
    input={CAPTURED_APP_FORM_INPUT}
  />
);

#!/usr/bin/env node

import React from 'react';
import { Command } from 'commander';
import { render } from 'ink';
import InputView, { DEFAULT_VALUES, FIELD_MAP } from './rdx-app/InputView';

/**
 * The App program.
 * @type {Object}
 * */
const Program = new Command();

Program
  .option('-t, --title <value>', FIELD_MAP.title)
  .option('-p, --desc <value>', FIELD_MAP.description)
  .option('-r, --theme-color <value>', FIELD_MAP.themeColor)
  .option('-b, --base <directory>', FIELD_MAP.baseDirectory)
  .option('-i, --icons', FIELD_MAP.includeIcons)
  .option('-d, --default', FIELD_MAP.isDefaultApp)
  .option('-o, --overwrite', FIELD_MAP.overwrite)
  .option('-y, --yes', 'Do not prompt for additional input')
  .parse(process.argv);

const COMMAND_LINE_INPUT = Program.opts();
const {
  title,
  desc: description,
  themeColor,
  base: baseDirectory,
  icons: includeIcons,
  default: isDefaultApp,
  overwrite,
  yes: noPrompt = false
} = COMMAND_LINE_INPUT;
const INPUT_VIEW_INPUT = {
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
    noPrompt={noPrompt}
    input={INPUT_VIEW_INPUT}
  />
);

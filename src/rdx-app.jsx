#!/usr/bin/env node

import React, { Component } from 'react';
import { Command } from 'commander';
import { render, Box } from 'ink';
import TextInput from 'ink-text-input';
// const App = require('');

/**
 * The App program.
 * @type {Object}
 * */
const Program = new Command();

Program
  .option('-t, --title', 'The application title. Example: My App', 'App')
  .option('-p, --description', 'The application description.', '')
  .option('-r, --theme-color', 'The theme color.', '#ffffff')
  .option('-b, --base <directory>', 'The base directory for app files.', 'src')
  .option('-i, --icons', 'Include app icons and metadata.', true)
  .option('-d, --default', 'Is the application the default application?', false)
  .option('-o, --overwrite', 'Overwrite existing files.', false)
  .parse(process.argv);

const {
  title,
  description,
  themeColor,
  base: baseDirectory,
  icons: includeIcons,
  default: isDefaultApp,
  overwrite
} = Program;

class AppForm extends Component {
  state = {
    appTitle: ''
  };

  onAppTitleChange = appTitle => this.setState({ appTitle });

  render () {
    const {
      appTitle
    } = this.state;

    return (
      <Box>
        <Box marginRight={1}>
          App Title (RDX App):
        </Box>
        <TextInput
          value={appTitle}
          onChange={this.onAppTitleChange}
        />
      </Box>
    );
  }
}

render(<AppForm/>);

// const exec = async () => {
//   const app = new App({
//     currentWorkingDirectory: process.cwd(),
//     title,
//     description,
//     themeColor,
//     baseDirectory,
//     includeIcons,
//     isDefaultApp,
//     overwrite
//   });
//
//   await app.execute();
// };
//
// exec()
//   .then(() => {
//     process.exit();
//   });

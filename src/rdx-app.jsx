#!/usr/bin/env node

import React, { Component, Fragment } from 'react';
import { Command } from 'commander';
import { render, Box, Static, Text } from 'ink';
import BigText from 'ink-big-text';
import TextInput from 'ink-text-input';
import App from './App';

const FIELD_MAP = {
  title: 'App Title',
  description: 'Description',
  themeColor: 'Theme Color',
  baseDirectory: 'Base Directory',
  includeIcons: 'Include icons?',
  isDefaultApp: 'Is this the default app?',
  overwrite: 'Overwrite existing files?'
};
const DEFAULT_VALUES = {
  title: 'RDX App',
  description: 'A PWA application.',
  themeColor: '#ffffff',
  baseDirectory: 'src',
  includeIcons: true,
  isDefaultApp: true,
  overwrite: true
};

/**
 * The App program.
 * @type {Object}
 * */
const Program = new Command();

Program
  .option('-t, --title', 'The application title. Example: My App', DEFAULT_VALUES.title)
  .option('-p, --description', 'The application description.', DEFAULT_VALUES.description)
  .option('-r, --theme-color', 'The theme color.', DEFAULT_VALUES.themeColor)
  .option('-b, --base <directory>', 'The base directory for app files.', DEFAULT_VALUES.baseDirectory)
  .option('-i, --icons', 'Include app icons and metadata.', DEFAULT_VALUES.includeIcons)
  .option('-d, --default', 'Is the application the default application?', DEFAULT_VALUES.isDefaultApp)
  .option('-o, --overwrite', 'Overwrite existing files.', DEFAULT_VALUES.overwrite)
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
const CAPTURED_APP_FORM_INPUT = {
  title,
  description,
  themeColor,
  baseDirectory,
  includeIcons,
  isDefaultApp,
  overwrite
};

type AppFormInput = {
  title: string,
  description: string,
  themeColor: string,
  baseDirectory: string,
  includeIcons: boolean,
  isDefaultApp: boolean,
  overwrite: boolean
};
type AppFormProps = {
  input: AppFormInput
};
type AppFormState = {
  input: AppFormInput,
  currentField: string
};

class AppForm extends Component<AppFormProps, AppFormState> {
  constructor (props = {}) {
    const {
      input = {}
    } = props;

    super(props);

    this.setState({ input });
  }

  state = {
    input: {},
    currentField: 'title'
  };

  exec = async () => {
    const {
      input = {}
    } = this.state;
    const app = new App({
      currentWorkingDirectory: process.cwd(),
      ...input
    });

    await app.execute();
  };

  propChangeHandlerCache = {};

  getPropsChangeHandler = (propName = '') => {
    if (!(this.propChangeHandlerCache[propName] instanceof Function)) {
      this.propChangeHandlerCache[propName] = (newValue = '') =>
        this.setState({ [propName]: newValue });
    }

    return this.propChangeHandlerCache[propName];
  };

  onToggleCurrentField = () => {
    const {
      currentField
    } = this.state;

    let newCurrentField,
      found = false;

    for (const k in FIELD_MAP) {
      if (!!found) {
        newCurrentField = k;
      }

      if (k === currentField) {
        found = true;
      }
    }

    if (!!newCurrentField) {
      this.setState({ currentField: newCurrentField });
    } else {
      this.exec()
        .then(() => process.exit(0))
        .catch(e => console.log('There was an error:', e));
    }
  };

  renderField = ({ currentField = '', targetField = '' } = {}) => {
    const {
      [targetField]: label = ''
    } = FIELD_MAP;
    const {
      input: {
        [targetField]: value = ''
      } = {}
    } = this.state;
    const {
      [targetField]: defaultValue = ''
    } = DEFAULT_VALUES;

    return currentField === targetField ?
      (
        <Box>
          <Box marginRight={1}>
            {label} ({defaultValue}):
          </Box>
          <TextInput
            value={value}
            onChange={this.getPropsChangeHandler(targetField)}
            onSubmit={this.onToggleCurrentField}
          />
        </Box>
      ) : (
        <Box>
          <Box marginRight={1}>
            {label} ({defaultValue}):
          </Box>
          <Text>
            {value}
          </Text>
        </Box>
      );
  };

  render () {
    const {
      currentField
    } = this.state;
    const fieldList = Object
      .keys(FIELD_MAP);

    return (
      <Box
        flexDirection='column'
      >
        <Static>
          <BigText
            text='RDX'
          />
        </Static>
        {fieldList.map(targetField => (
          <Fragment
            key={`Field:${targetField}`}
          >
            {this.renderField({ currentField, targetField })}
          </Fragment>
        ))}
      </Box>
    );
  }
}

render(
  <AppForm
    input={CAPTURED_APP_FORM_INPUT}
  />
);

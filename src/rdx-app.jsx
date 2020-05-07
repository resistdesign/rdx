#!/usr/bin/env node

import React, { Component, Fragment } from 'react';
import { Command } from 'commander';
import { render, Box, Static, Text } from 'ink';
import BigText from 'ink-big-text';
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
const DEFAULT_APP_FORM_PROPS = {
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
  static getDerivedStateFromProps = (props = {}, state = {}) => {
    const {
      input: defaultInput = {}
    } = props;
    const {
      input = {}
    } = state;

    return {
      input: {
        ...defaultInput,
        ...input
      },
      ...state
    };
  };

  state = {
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

  fieldMap = {
    title: 'App Title',
    description: 'Description'
  };

  onToggleCurrentField = () => {
    const {
      currentField
    } = this.state;

    let newCurrentField,
      found = false;

    for (const k in this.fieldMap) {
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
    } = this.fieldMap;
    const {
      input: {
        [targetField]: defaultValue = ''
      } = {}
    } = this.props;
    const {
      input: {
        [targetField]: value = ''
      } = {}
    } = this.state;

    return currentField === targetField ?
      (
        <Box>
          <Box marginRight={1}>
            {label} ({defaultValue}):
          </Box>
          <TextInput
            value={value}
            onChange={this.getPropsChangeHandler(targetField)}
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
      .keys(this.fieldMap);

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
    input={DEFAULT_APP_FORM_PROPS}
  />
);

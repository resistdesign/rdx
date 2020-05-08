#!/usr/bin/env node

import React, { Component, Fragment } from 'react';
import { Command } from 'commander';
import { render, Box } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
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
  description: 'A progressive web application.',
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

type AppFormInput = {
  title?: string,
  description?: string,
  themeColor?: string,
  baseDirectory?: string,
  includeIcons?: boolean,
  isDefaultApp?: boolean,
  overwrite?: boolean
};
type AppFormProps = {
  input: AppFormInput
};
type AppFormState = {
  input: AppFormInput,
  currentField: string
};

class AppForm extends Component<AppFormProps, AppFormState> {
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
      this.propChangeHandlerCache[propName] = (newValue = '') => {
        const {
          input
        } = this.state;

        this.setState({
          input: {
            ...input,
            [propName]: newValue
          }
        });
      };
    }

    return this.propChangeHandlerCache[propName];
  };

  onToggleCurrentField = () => {
    const {
      input = {},
      currentField
    } = this.state;
    const {
      [currentField]: currentFieldValue
    } = input;
    const {
      input: {
        [currentField]: currentFieldDefaultValue
      } = {}
    } = this.props;

    let newCurrentField,
      found = false;

    for (const k in FIELD_MAP) {
      if (!!found) {
        newCurrentField = k;
        break;
      }

      if (k === currentField) {
        found = true;
      }
    }

    if (typeof currentFieldValue === 'undefined') {
      this.setState({
        input: {
          ...input,
          [currentField]: currentFieldDefaultValue
        }
      });
    }

    if (!!newCurrentField) {
      this.setState({ currentField: newCurrentField });
    } else {
      this.exec()
        .then(() => process.exit(0))
        .catch(e => console.log('There was an error:', e));
    }
  };

  getBooleanInputSelectHandler = (propName = '') => ({ value = false } = {}) => {
    const propChangeHandler = this.getPropsChangeHandler(propName);

    propChangeHandler(value);
    this.onToggleCurrentField();
  };

  getFieldIsAnswered = (targetField = '') => {
    const {
      currentField
    } = this.state;
    const fieldList = Object.keys(FIELD_MAP);

    return fieldList.indexOf(targetField) < fieldList.indexOf(currentField);
  };

  renderField = ({ currentField = '', targetField = '' }: {
    currentField: $Keys<typeof DEFAULT_VALUES>,
    targetField: $Keys<typeof DEFAULT_VALUES>
  } = {}) => {
    const {
      [targetField]: label = ''
    } = FIELD_MAP;
    const {
      input: {
        [targetField]: value = ''
      } = {}
    } = this.state;
    const {
      input: {
        [targetField]: defaultValue = ''
      } = {}
    } = this.props;
    const fieldType = typeof DEFAULT_VALUES[targetField];
    const fieldIsAnswered = this.getFieldIsAnswered(targetField);

    return currentField === targetField ?
      (
        fieldType === 'boolean' ? (
          <Box
            flexDirection='column'
          >
            <Box marginRight={1}>
              {label} ({!!defaultValue ? 'Yes' : 'No'}):
            </Box>
            <SelectInput
              items={[
                {
                  label: 'Yes',
                  value: true
                },
                {
                  label: 'No',
                  value: false
                }
              ]}
              onSelect={this.getBooleanInputSelectHandler(targetField)}
            />
          </Box>
        ) : (
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
        )
      ) : !!fieldIsAnswered ? (
        fieldType === 'boolean' ? (
          <Box>
            <Box marginRight={1}>
              {label}: {!!value ? 'Yes' : 'No'}
            </Box>
          </Box>
        ) : (
          <Box>
            <Box marginRight={1}>
              {label}: {value}
            </Box>
          </Box>
        )
      ) : undefined;
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

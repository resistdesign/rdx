import React, { Component, Fragment } from 'react';
import Command from './Command';
import { Box } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

export const FIELD_MAP = {
  title: 'App Title',
  description: 'Description',
  themeColor: 'Theme Color',
  baseDirectory: 'Base Directory',
  includeIcons: 'Include icons?',
  isDefaultApp: 'Is this the default app?',
  overwrite: 'Overwrite existing files?'
};
export const DEFAULT_VALUES = {
  title: 'RDX App',
  description: 'A progressive web application.',
  themeColor: '#ffffff',
  baseDirectory: 'src',
  includeIcons: true,
  isDefaultApp: true,
  overwrite: true
};

export type AppFormInput = {
  title?: string,
  description?: string,
  themeColor?: string,
  baseDirectory?: string,
  includeIcons?: boolean,
  isDefaultApp?: boolean,
  overwrite?: boolean
};
export type AppFormProps = {
  input: AppFormInput
};
export type AppFormState = {
  input: AppFormInput,
  currentField: string
};

export default class InputView extends Component<AppFormProps, AppFormState> {
  state = {
    input: {},
    currentField: 'title'
  };

  exec = async () => {
    const {
      input = {}
    } = this.state;
    const app = new Command({
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
        .catch(e => {
          console.log('There was an error:', e);
          process.exit(1);
        });
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

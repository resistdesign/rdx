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
  noPrompt?: boolean,
  input: AppFormInput
};
export type AppFormState = {
  input: AppFormInput,
  currentField?: string
};

const getFieldList = (userInput = {}) => Object
  .keys(FIELD_MAP)
  .filter(k => typeof userInput[k] === 'undefined');

export default class InputView extends Component<AppFormProps, AppFormState> {
  static getDerivedStateFromProps = (newProps = {}, newState = {}) => {
    const {
      input: userInput = {}
    } = newProps;
    const {
      currentField = getFieldList(userInput)[0]
    } = newState;

    return {
      ...newState,
      currentField
    };
  };

  state = {
    input: {},
    currentField: undefined
  };

  componentDidMount () {
    const {
      noPrompt = false
    } = this.props;

    if (!!noPrompt) {
      this.exec();
    }
  }

  getFieldList = () => {
    const {
      input: userInput = {}
    } = this.props;

    return getFieldList(userInput);
  };

  getPreAssignedInput = () => {
    const {
      input: userInput = {}
    } = this.props;
    const cleanUserInput = Object
      .keys(userInput)
      .filter(k => typeof userInput[k] !== 'undefined')
      .reduce((acc, k) => ({ ...acc, [k]: userInput[k] }), {});

    return {
      ...DEFAULT_VALUES,
      ...cleanUserInput
    };
  };

  exec = async () => {
    const {
      input = {}
    } = this.state;
    const preAssignedInput = this.getPreAssignedInput();
    const combinedInput = {
      ...preAssignedInput,
      ...input
    };
    const app = new Command({
      ...combinedInput,
      currentWorkingDirectory: process.cwd()
    });

    let errorCode = 0;

    try {
      await app.execute();
    } catch (error) {
      console.log('There was an error:', error);
      errorCode = 1;
    }

    process.exit(errorCode);
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
    const fieldList = this.getFieldList();

    let newCurrentField,
      found = false;

    if (typeof currentField === 'undefined') {
      newCurrentField = fieldList[0];
    } else {
      for (let i = 0; i < fieldList.length; i++) {
        const k = fieldList[i];

        if (!!found) {
          newCurrentField = k;
          break;
        }

        if (k === currentField) {
          found = true;
        }
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
      this.exec();
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
    const fieldList = this.getFieldList();

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
      [targetField]: defaultValue = ''
    } = this.getPreAssignedInput();
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
      noPrompt = false
    } = this.props;
    const {
      currentField
    } = this.state;
    const fieldList = !!noPrompt ? [] : this.getFieldList();

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

import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

const {{name}} = class extends Component {
  static propTypes = {};

  constructor() {
    super();
  }

  state = {};

  render() {
    return (
      <h1>
        {{title}}
      </h1>
    );
  }
}

export default hot(module)({{name}});

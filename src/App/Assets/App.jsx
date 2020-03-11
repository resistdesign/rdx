import { hot } from 'react-hot-loader';
import React, { Component } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #app-root {
    min-width: 100vw;
    min-height: 100vh;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: sans-serif;
  }
`;
const Base = styled.div`
  
`;

export class ___APP_CLASS_NAME___ extends Component {
  static propTypes = {};

  render () {
    return (
      <>
        <GlobalStyle/>
        <Base>
          <h1>___APP_NAME___</h1>
        </Base>
      </>
    );
  }
}

export default hot(module)(___APP_CLASS_NAME___);

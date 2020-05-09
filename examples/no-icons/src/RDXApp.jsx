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

type PropsType = {};
type StateType = {};

export class RDXApp extends Component<PropsType, StateType> {
  static propTypes = {};

  render () {
    return (
      <>
        <GlobalStyle/>
        <Base>
          <h1>RDX App</h1>
        </Base>
      </>
    );
  }
}

export default hot(module)(RDXApp);

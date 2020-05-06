#!/usr/bin/env node

process.env.EXECUTABLE_EXTENSION = 'harness.jsx';

require('resistdesign-babel-register');
require('./index');

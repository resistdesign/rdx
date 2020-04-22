#!/usr/bin/env node

process.env.EXECUTABLE_EXTENSION = 'jsx';

require('resistdesign-babel-register');
require('./index');

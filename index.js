#!/usr/bin/env node

require('babel-core/register')({
  stage: 0
});
require('./src/rdx');

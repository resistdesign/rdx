#!/usr/bin/env node

require('babel-core/register')({
  stage: 0,
  only: [
    /^(?!.*\/node_modules\/).*$/
  ]
});
require('./src/rdx');

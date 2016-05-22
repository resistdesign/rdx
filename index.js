#!/usr/bin/env node

require('babel-core/register')({
  stage: 0,
  only: [
    /^((?!\/node_modules\/((?!@resistdesign))).)*$/m
  ]
});
require('./src/rdx');

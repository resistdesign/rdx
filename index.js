#!/usr/bin/env node

require('babel-core/register')({
  plugins: [
    'add-module-exports',
    'transform-object-rest-spread',
    'transform-class-properties',
    'transform-function-bind',
    'transform-runtime'
  ],
  presets: [
    [
      'env',
      {
        targets: {
          node: true
        }
      }
    ]
  ],
  only: [
    /^((?!\/node_modules\/((?!@resistdesign))).)*$/m
  ]
});
require('./src/rdx');

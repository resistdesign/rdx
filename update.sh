#!/bin/bash

git checkout master -- README.md
marked -o README.html README.md --gfm
mustache -p README.html view.json index.mustache > index.html

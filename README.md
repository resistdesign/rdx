# RDX

An HTML, ES2016, JSX compiler.

## ⚠️ WARNING: DO NOT USE ON WINDOWS FOR NOW!

## Badge

[![RDX Enabled](https://img.shields.io/badge/rdx-enabled-blue.svg?style=flat-square)](http://rdx.resist.design)

```markdown
[![RDX Enabled](https://img.shields.io/badge/rdx-enabled-blue.svg?style=flat-square)](http://rdx.resist.design)
```

## Usage

Compile modern **HTML** web applications that include **ES6+** JavaScript and **JSX** code.

1. **Compile**: `rdx compile -a src/path/app-name.html`
1. **Serve**: `rdx serve -a src/path/app-name.html --open`
1. Example app: https://github.com/resistdesign/rdx-example

## Installation

1. Requires:
    - NodeJS 4+
    - NPM 3+
1. Run: `npm i -g @resistdesign/rdx`

## Commands

1. `-h`: Usage/Help (All Commands). Example: `rdx app -h`
1. `-v`: Display the current RDX version.
1. `app`: Create an app with the default RDX structure.
1. `serve`: Serve an HTML application for live development.
    - WebPack Dev Server: https://webpack.github.io/docs/webpack-dev-server.html
1. `compile`: Compile an HTML application for deployment.

## Configure

Command flag values may be pre-configured by declaring them in the `package.json` file for a given project.

Example:

```json
{
    "name": "example-app",
    ...
    "rdx": {
        "serve": {
            "proxy": "http://example.com:80"
        }    
    }
}
```

**NOTE:** Flag values passed in the command line will supersede any pre-configured values.

## Supported Features

1. Multiple HTML Apps Per Project
1. Multiple JS Apps Per HTML App
1. Images (PNG, JPG, SVG, ICO)
  - Include in HTML: `<img src="/folder/file.svg">`
    - Just link for deployment: `<link rel="something" href="/folder/file.svg">`
  - Import in JS: `import MySrc from './folder/file.svg';`
    - Use in JSX: `<img src={MySrc}/>`
1. Fonts (WOFF, TTF, EOT, SVG, OTF)
1. CSS/LESS (Auto-Prefixed)
  - Hot reloading supported when imported into JS files.
1. ES6+ (Stage 0)
1. JSX

## Tech

1. WebPack: https://webpack.github.io
1. Babel: https://babeljs.io
1. React Hot Loader: https://gaearon.github.io/react-hot-loader

## License

MIT

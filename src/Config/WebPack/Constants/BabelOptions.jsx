export const BABEL_OPTIONS_PHASE_1 = {
  babelrc: false,
  plugins: [
    require.resolve('babel-plugin-transform-flow-strip-types'),
    require.resolve('react-hot-loader/babel'),
    require.resolve('babel-plugin-transform-react-jsx'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    require.resolve('babel-plugin-transform-function-bind'),
    require.resolve('babel-plugin-add-module-exports'),
    [
      require.resolve('babel-plugin-transform-runtime'),
      {
        helpers: true,
        polyfill: true,
        regenerator: true
      }
    ]
  ]
};

export const BABEL_OPTIONS_PHASE_2 = {
  babelrc: false,
  presets: [
    [
      require.resolve('babel-preset-env'),
      {
        target: {
          browsers: [
            'last 2 versions'
          ]
        }
      }
    ]
  ]
};

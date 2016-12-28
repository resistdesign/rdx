export default JSON.stringify({
  'plugins': [
    require.resolve('babel-plugin-transform-react-jsx'),
    require.resolve('babel-plugin-transform-class-properties'),
    require.resolve('babel-plugin-transform-object-rest-spread'),
    require.resolve('babel-plugin-transform-function-bind'),
    require.resolve('babel-plugin-transform-runtime'),
    require.resolve('babel-plugin-add-module-exports')
  ],
  'presets': [
    [
      require.resolve('babel-preset-env'),
      {
        'targets': {
          'browsers': [
            'last 2 versions'
          ]
        }
      }
    ]
  ]
});

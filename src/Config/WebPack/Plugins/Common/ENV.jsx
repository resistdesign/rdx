import WebPack from 'webpack';

const DEVELOPMENT_ENV = 'development';
const CURRENT_ENV = process.env.NODE_ENV || DEVELOPMENT_ENV;

export default function () {
  return [
    new WebPack.DefinePlugin({
      'process.env': JSON.stringify({
        NODE_ENV: process.env && process.env.NODE_ENV,
        DEBUG: process.env && process.env.DEBUG,
        IS: {
          [CURRENT_ENV]: true
        }
      })
    })
  ];
}

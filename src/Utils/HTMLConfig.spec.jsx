import expect from 'expect.js';
import HTMLConfig from './HTMLConfig';

export default {
  'HTMLConfig': {
    'should populate its own properties on construction': () => {
      const config = {
        hash: 'abcdefg',
        fullFilePath: './src/index.html',
        fullContextPath: './src/'
      };
      const htmlConfig = new HTMLConfig(config);

      expect(htmlConfig.hash).to.be(config.hash);
      expect(htmlConfig.fullFilePath).to.be(config.fullFilePath);
      expect(htmlConfig.fullContextPath).to.be(config.fullContextPath);
    },
    'getCurrentData': {
      'should return an object with content': () => {

      }
    }
  }
};

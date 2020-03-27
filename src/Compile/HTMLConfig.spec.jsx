import expect from 'expect.js';
import HTMLConfig from './HTMLConfig';
import { includeParentLevels } from '../../TestUtils';

const getHTMLConfigStructure = ({
                                  content = '<html></html>',
                                  fullFilePath = './src/index.html',
                                  fullContextPath = './src/'
                                } = {}) => {
  const config = {
    content,
    fullFilePath,
    fullContextPath
  };
  const htmlConfig = new HTMLConfig(config);

  return {
    config,
    htmlConfig
  };
};

export default includeParentLevels(
  __dirname,
  {
    'HTMLConfig': {
      'should populate its own properties on construction': () => {
        const {
          config,
          htmlConfig
        } = getHTMLConfigStructure();

        expect(htmlConfig.content).to.be(config.content);
        expect(htmlConfig.fullFilePath).to.be(config.fullFilePath);
        expect(htmlConfig.fullContextPath).to.be(config.fullContextPath);
      },
      'getCurrentData': {
        'should return an object with a content hash': () => {
          const { htmlConfig } = getHTMLConfigStructure();
          const { contentHash } = htmlConfig.getCurrentData();

          expect(!!contentHash).to.be(true);
        },
        'should return an object with content': () => {
          const { htmlConfig } = getHTMLConfigStructure();
          const { content } = htmlConfig.getCurrentData();

          expect(!!content).to.be(true);
        },
        'should return an object with an entry point map': () => {
          const { htmlConfig } = getHTMLConfigStructure();
          const { entry } = htmlConfig.getCurrentData();

          expect(entry).to.be.an(Object);
        },
        'should return an object with a worker entry point map': () => {
          const { htmlConfig } = getHTMLConfigStructure();
          const { workerEntry } = htmlConfig.getCurrentData();

          expect(workerEntry).to.be.an(Object);
        }
      }
    }
  }
);

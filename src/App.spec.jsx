import expect from 'expect.js';
import { includeParentLevels } from '../TestUtils';
import App from './App';

export default includeParentLevels(
  __dirname,
  {
    'App': {
      'should configure properties on construction': () => {
        const config = {
          currentWorkingDirectory: 'dir',
          title: 'My App',
          description: 'This is an application.',
          themeColor: '#111111',
          baseDirectory: 'src',
          appFilePath: 'index.html',
          includeIcons: true,
          isDefaultApp: true
        };
        const app = new App(config);

        expect(app.currentWorkingDirectory).to.be(config.currentWorkingDirectory);
        expect(app.title).to.be(config.title);
        expect(app.description).to.be(config.description);
        expect(app.themeColor).to.be(config.themeColor);
        expect(app.baseDirectory).to.be(config.baseDirectory);
        expect(app.appFilePath).to.be(config.appFilePath);
        expect(app.includeIcons).to.be(config.includeIcons);
        expect(app.isDefaultApp).to.be(config.isDefaultApp);
      },
      'getTemplateData': {
        'should build an object with data for app asset templates': () => {
        }
      }
    }
  }
);

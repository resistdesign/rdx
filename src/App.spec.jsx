import expect from 'expect.js';
import { includeParentLevels } from '../TestUtils';
import App from './App';

const BASIC_APP_CONFIG = {
  currentWorkingDirectory: 'dir',
  title: 'My App',
  description: 'This is an application.',
  themeColor: '#111111',
  baseDirectory: 'src',
  includeIcons: true,
  isDefaultApp: true
};

export default includeParentLevels(
  __dirname,
  {
    'App': {
      'should configure properties on construction': () => {
        const app = new App(BASIC_APP_CONFIG);

        expect(app.currentWorkingDirectory).to.be(BASIC_APP_CONFIG.currentWorkingDirectory);
        expect(app.title).to.be(BASIC_APP_CONFIG.title);
        expect(app.description).to.be(BASIC_APP_CONFIG.description);
        expect(app.themeColor).to.be(BASIC_APP_CONFIG.themeColor);
        expect(app.baseDirectory).to.be(BASIC_APP_CONFIG.baseDirectory);
        expect(app.includeIcons).to.be(BASIC_APP_CONFIG.includeIcons);
        expect(app.isDefaultApp).to.be(BASIC_APP_CONFIG.isDefaultApp);
      },
      'getTemplateData': {
        'should build an object with data for app asset templates': () => {
          const app = new App(BASIC_APP_CONFIG);
          const templateData = app.getTemplateData();

          console.log(templateData);

          expect(templateData.APP_NAME).to.be('My App');
          expect(templateData.APP_PATH_NAME).to.be('my-app');
          expect(templateData.APP_CLASS_NAME).to.be('MyApp');
          expect(templateData.APP_DESCRIPTION).to.be('This is an application.');
          expect(templateData.THEME_COLOR).to.be('#111111');
        }
      }
    }
  }
);

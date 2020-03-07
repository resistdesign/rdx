export default class WebPackConfig {
  context;
  fullFilePath;

  constructor (config = {}) {
    Object.assign(this, config);
  }


}
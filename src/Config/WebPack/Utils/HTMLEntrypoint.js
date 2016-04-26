import XMLDOC from './xmldoc';

function isStringURL(item) {
  return typeof item === 'string' &&
    item !== '';
}

export default class HTMLEntrypoint {
  nodes;

  constructor(html) {
    this.nodes = XMLDOC.XmlDocument(html);
  }

  getNodesByName(name, node) {
    let nodes = [];

    if (typeof name === 'string' && node instanceof Object) {
      if (node instanceof Array) {
        for (let i = 0; i < node.length; i++) {
          const child = node[i];

          if (child instanceof Object) {
            const childList = this.getNodesByName(name, child);

            nodes = [
              ...nodes,
              ...childList
            ];
          }
        }
      } else if (node instanceof Object) {
        const childList = this.getNodesByName(name, node.children);

        if (typeof node.name === 'string' && node.name.toLowerCase() === name.toLowerCase()) {
          nodes.push(node);
        }

        nodes = [
          ...nodes,
          ...childList
        ];
      }
    }

    return nodes;
  }

  getLinks() {
    return this.getNodesByName('link', this.nodes)
      .map(link => {
        return link.attrs && link.attrs.href;
      })
      .filter(isStringURL);
  }

  getScripts() {
    return this.getNodesByName('script', this.nodes)
      .map(script => {
        return script.attrs && script.attrs.src;
      })
      .filter(isStringURL);
  }

  getImages() {
    return this.getNodesByName('img', this.nodes)
      .map(image => {
        return src
        :
        image.attrs && image.attrs.src;
      })
      .filter(isStringURL);
  }

  getEntrypoints() {
    const entryMap = {};
    const list = [
      ...this.getLinks(),
      ...this.getScripts(),
      ...this.getImages()
    ];

    list.forEach(item => {
      entryMap[item] = item;
    });

    return entryMap;
  }
}

import htmlparser from 'htmlparser';

function isStringURL(item) {
  return typeof item === 'string' &&
    item !== '';
}

export default class HTMLEntrypoint {
  nodes;

  constructor(html) {
    var handler = new htmlparser.DefaultHandler();
    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(html);
    this.nodes = handler.dom;
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
        return link.attribs && link.attribs.href;
      })
      .filter(isStringURL);
  }

  getScripts() {
    return this.getNodesByName('script', this.nodes)
      .map(script => {
        return script.attribs && script.attribs.src;
      })
      .filter(isStringURL);
  }

  getImages() {
    return this.getNodesByName('img', this.nodes)
      .map(image => {
        return image.attribs && image.attribs.src;
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

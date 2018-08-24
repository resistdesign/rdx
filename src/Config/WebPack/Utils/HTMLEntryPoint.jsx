import Path from 'path';
import htmlparser from 'htmlparser';

const FILE_EXT_TEST = /\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf|json|xml|css|less|js|jsx|php)/;
const VOID_HTML_ELEMENT_MAP = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};
const SERVER_SIDE_CODE_REL = 'server-side-code';

function isStringURL (item) {
  return typeof item === 'string' &&
    item !== '' &&
    FILE_EXT_TEST.test(Path.extname(item)) &&
    item.indexOf('//') === -1;
}

export default class HTMLEntryPoint {
  static getPathWithHash (path, hash) {
    let newPath = path;

    if (
      typeof path === 'string' &&
      typeof hash === 'string'
    ) {
      newPath = `${path}?${hash}`;
    }

    return newPath;
  }

  html;
  nodes;

  constructor (html) {
    this.html = html;
    const handler = new htmlparser.DefaultHandler();
    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(this.html);
    this.nodes = handler.dom;
  }

  toHTML (nodeSet, hash, inlineContent = '') {
    const html = [];
    const targetNodes = nodeSet || this.nodes;

    if (targetNodes instanceof Array) {
      targetNodes.forEach(node => {
        switch (node.type) {
          case 'text':
            html.push(node.data);
            break;
          case 'directive':
            html.push(`<${node.data}>`);
            break;
          case 'comment':
            html.push(`<!-- ${node.data} -->`);
            break;
          case 'link':
            if (node.attribs instanceof Object && node.attribs.rel === SERVER_SIDE_CODE_REL) {
              return;
            }
          default:
            if (node.attribs instanceof Object) {
              const attribList = [];

              for (const k in node.attribs) {
                if (node.attribs.hasOwnProperty(k)) {
                  let attrValue = node.attribs[k];
                  const ext = Path.extname(attrValue);

                  if (
                    node.name.toLowerCase() === 'link' &&
                    k.toLowerCase() === 'href' &&
                    ext === '.less'
                  ) {
                    attrValue += '.css';
                  }

                  if (
                    (
                      node.name.toLowerCase() === 'meta' &&
                      k.toLowerCase() === 'content' &&
                      FILE_EXT_TEST.test(ext)
                    ) ||
                    (
                      node.name.toLowerCase() === 'link' &&
                      k.toLowerCase() === 'href'
                    ) ||
                    (
                      (
                        node.name.toLowerCase() === 'script' ||
                        node.name.toLowerCase() === 'img'
                      ) &&
                      k.toLowerCase() === 'src'
                    )
                  ) {
                    attrValue = HTMLEntryPoint.getPathWithHash(attrValue, hash);
                  }

                  attribList.push(`${k}="${attrValue}"`);
                }
              }

              html.push(`<${node.name} ${attribList.join(' ')}`);
            } else {
              html.push(`<${node.data.replace(/\/$/, '')}`);
            }

            if (!/\/$/.test(node.data) && !VOID_HTML_ELEMENT_MAP[node.name]) {
              html.push('>');
              if (node.children instanceof Array) {
                html.push(this.toHTML(node.children, hash, inlineContent));
              }
              if (
                typeof node.name === 'string' &&
                node.name.toLowerCase() === 'head' &&
                inlineContent
              ) {
                html.push(inlineContent);
              }
              html.push(`</${node.name}>`);
            } else if (!/\/$/.test(node.data)) {
              html.push('>');
            } else {
              html.push('/>');
            }
            break;
        }
      });
    }

    return html.join('');
  }

  getNodesByName (name, node) {
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

  getMeta () {
    return this.getNodesByName('meta', this.nodes)
      .map(meta => {
        return meta.attribs && meta.attribs.content;
      })
      .filter(isStringURL);
  }

  getLinks () {
    return this.getNodesByName('link', this.nodes)
      .map(link => {
        return link.attribs && link.attribs.href;
      })
      .filter(isStringURL);
  }

  getScripts () {
    return this.getNodesByName('script', this.nodes)
      .map(script => {
        return script.attribs && script.attribs.src;
      })
      .filter(isStringURL);
  }

  getImages () {
    return this.getNodesByName('img', this.nodes)
      .map(image => {
        return image.attribs && image.attribs.src;
      })
      .filter(isStringURL);
  }

  getEntrypoints () {
    const entryMap = {};
    const list = [
      ...this.getMeta(),
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

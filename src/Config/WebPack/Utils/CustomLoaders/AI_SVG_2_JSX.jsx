import htmlparser from 'htmlparser';

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
const CUSTOM_ATTRIBUTE_DELIMITER = '@';
const CUSTOM_DIRECTIVE_DELIMITER = '#';
const DIRECTIVE_MAP = {
  shape: (node = {}) => {
    const {
      props,
      children: [
        {
          props: shapeProps = {},
          ...shape
        } = {}
      ] = []
    } = node;

    return {
      ...shape,
      props: {
        ...shapeProps,
        ...props
      }
    };
  }
};
const processDirectives = (node = {}, directives = []) =>
  directives.reduce((acc, d) => {
    const directiveFunction = DIRECTIVE_MAP[d];

    return directiveFunction instanceof Function ?
      directiveFunction(acc) :
      acc;
  }, node);
const svgToJSON = (svg) => {
  const handler = new htmlparser.DefaultHandler();
  const parser = new htmlparser.Parser(handler);

  parser.parseComplete(svg);

  return handler.dom;
};
const getUIDString = () => Math.random().toString(36).substr(2)
  + Math.random().toString(36).substr(2)
  + Math.random().toString(36).substr(2)
  + Math.random().toString(36).substr(2);
const convertIdCharacters = (idString = '') => {
  const reg = '_x[^_][0-9a-zA-z]_';
  const regex = new RegExp(reg, 'g');
  const chars = idString.match(regex);
  const underscorePlaceholder = '<<<***' + getUIDString() + '***>>>';

  let newLabel = idString;

  for (const l in chars) {
    const currChar = chars[l];
    const currCharCode = '0' + currChar.split('_').join('');

    let newChar = String.fromCharCode(Number(currCharCode));

    // TRICKY: Be careful with underscores, spaces must be inserted first.
    if (newChar === '_') {
      newChar = underscorePlaceholder;
    }

    newLabel = newLabel.replace(currChar, newChar);
  }

  // TRICKY: Replace underscores with spaces.
  newLabel = newLabel.split('_').join(' ');

  // TRICKY: Now replace the underscores.
  newLabel = newLabel.split(underscorePlaceholder).join('_');

  return newLabel;
};
const getIdParts = (rawID = '') => {
  const id = convertIdCharacters(rawID);
  const [
    idPart = '',
    ...other
  ] = id.split(CUSTOM_ATTRIBUTE_DELIMITER);
  const [
    newId,
    ...directives
  ] = idPart.split(CUSTOM_DIRECTIVE_DELIMITER);
  const attributeString = other.join(CUSTOM_ATTRIBUTE_DELIMITER);

  return {
    id: newId,
    directives,
    attributeString
  };
};
const getTransformedAttributeParts = (attribs = {}) => {
  const {
    id,
    ...other
  } = attribs;
  const {
    id: newId,
    directives = [],
    attributeString
  } = getIdParts(id);
  const [
    {
      attribs: customAttribs = {}
    } = {}
  ] = svgToJSON(`<div ${attributeString}>`) || [];
  const newAttribs = {
    id: newId,
    ...other
  };

  Object
    .keys(customAttribs)
    .forEach(a => {
      delete newAttribs[a];
    });

  if (!newAttribs.id) {
    delete newAttribs.id;
  }

  return {
    customAttributeString: attributeString,
    newAttribs,
    directives
  };
};
const jsonToSVG = (targetNodes = []) => {
  const html = [];

  targetNodes.forEach(node => {
    switch (node.tagname) {
      case 'text':
        html.push(node.tagname);
        break;
      case 'directive':
        html.push(`<${node.tagname}>`);
        break;
      case 'comment':
        html.push(`<!-- ${node.tagname} -->`);
        break;
      default:
        let tagname = node.tagname,
          children = node.children;

        if (node.props instanceof Object) {
          // TRICKY: Run once to get the directives.
          const {
            directives = []
          } = getTransformedAttributeParts(node.props);
          // Process the directives.
          const {
            tagname: newTagname = '',
            props: newProps = {},
            children: newChildren = []
          } = processDirectives(node, directives);
          // TRICKY: Run again to get new attribute values.
          const {
            customAttributeString,
            newAttribs: props = {}
          } = getTransformedAttributeParts(newProps);
          const attribList = !!customAttributeString ? [customAttributeString] : [];

          tagname = newTagname;
          children = newChildren;

          for (const k in props) {
            if (props.hasOwnProperty(k)) {
              let attrValue = props[k];

              attribList.push(`${k}="${attrValue}"`);
            }
          }

          html.push(`<${tagname} ${attribList.join(' ')}`);
        }

        if (!VOID_HTML_ELEMENT_MAP[node.name]) {
          html.push('>');
          if (children instanceof Array) {
            html.push(jsonToSVG(children));
          }
          html.push(`</${tagname}>`);
        } else {
          html.push('/>');
        }
        break;
    }
  });

  return html.join('');
};

export default function (source) {
  if (!!this.cacheable) {
    this.cacheable();
  }

  return `
  import React from 'react';
  
  export default (props = {}) => (
    ${jsonToSVG([JSON.parse(source)])}
  );
  `;
}

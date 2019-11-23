import htmlparser from 'htmlparser';
import UUIDV4 from 'uuid/v4';
import CSS from 'css';
import {
  AllHtmlEntities as Entities
} from 'html-entities';

const ENTITIES = new Entities();
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
const TAGNAME_DIRECTIVES = [
  'style',
  'g',
  'path'
];
const SHAPE_DIRECTIVE_PROCESSOR = (node = {}) => {
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
};
const DIRECTIVE_MAP = {
  path: ({ props = {}, ...node } = {}) => {
    const {
      d = ''
    } = props;
    // TRICKY: Clean-up delimiters.
    const d2 = d
    // Add a space before negatives.
      .replace(/[0-9.]-/gm, x => x.replace('-', ' -'))
      // Space out letters.
      .replace(/[A-Za-z]/gm, x => ` *${x} `)
      // No commas, tabs or line returns. Space delimited only.
      .replace(/[,\t\n\r]/gm, ' ')
      // Get the point sets.
      .split('*')
      // Remove empty indices.
      .filter((p = '') => !!p.trim())
      // Convert to objects.
      .map(
        p => {
          const [
            type,
            ...coords
          ] = p.split(' ')
            .filter(sp => !!sp);

          return {
            type,
            points: coords
              .reduce((acc, c, i) => {
                const even = i % 2 === 0;

                if (even) {
                  acc.push({
                    x: c
                  });
                } else {
                  acc[acc.length - 1].y = c;
                }

                return acc;
              }, [])
          };
        }
      );

    return {
      props: {
        ...props,
        d: d2
          .map(
            ({ type = '', points = [] } = {}) =>
              `${type}${points instanceof Array && points.length > 0 ? ' ' : ''}${points.map(
                ({ x = '', y = '' } = {}) => `${x},${y}`
              ).join(' ')}`
          )
          .join(' ')
      },
      ...node
    };
  },
  shape: SHAPE_DIRECTIVE_PROCESSOR,
  g: (node = {}, ...other) => {
    const {
      props,
      children = []
    } = node;

    if (
      (!(props instanceof Object) || Object.keys(props).length < 1) &&
      children.length === 1
    ) {
      return SHAPE_DIRECTIVE_PROCESSOR(node, ...other);
    } else {
      return node;
    }
  },
  children: ({ children, ...node } = {}) => node,
  style: ({ props = {}, children = [], ...node } = {}, uuid = '') => {
    const cssString = children.join('');
    const cssObj = CSS.parse(cssString);
    const {
      stylesheet: {
        rules = [],
        ...stylesheet
      } = {},
      ...cssDoc
    } = cssObj;
    const newRules = rules.map((r = {}) => {
      const {
        selectors = [],
        ...rObj
      } = r;

      return {
        ...rObj,
        selectors: selectors.map((s = '') => s.indexOf('.') === 0 ? `.${uuid} ${s}` : s)
      };
    });
    const newCSSObj = {
      ...cssDoc,
      stylesheet: {
        ...stylesheet,
        rules: newRules
      }
    };

    return {
      ...node,
      props: {
        ...props,
        dangerouslySetInnerHTML: {
          __html: CSS.stringify(newCSSObj)
        }
      },
      children: []
    };
  }
};
const processDirectives = (node = {}, directives = [], uuid = '') =>
  directives.reduce((acc, d) => {
    const directiveFunction = DIRECTIVE_MAP[d];

    return directiveFunction instanceof Function ?
      directiveFunction(acc, uuid) :
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
const jsonToSVG = (targetNodes = [], uuid = '') => {
  const html = [];

  targetNodes.forEach(node => {
    if (typeof node === 'string') {
      html.push(node);

      return;
    }

    switch (node.tagname) {
      case 'directive':
        html.push(`<${node.tagname}>`);
        break;
      case 'comment':
        html.push(`<!-- ${node.tagname} -->`);
        break;
      default:
        const {
          props: nodeProps = {}
        } = node;
        const baseDirectives = [];
        let tagname = node.tagname,
          children = node.children;

        if (TAGNAME_DIRECTIVES.indexOf(tagname) !== -1) {
          baseDirectives.push(tagname);
        }

        const {
          props: {
            id: originalAttrsId
          } = {}
        } = node;
        // TRICKY: Run once to get the directives.
        const {
          directives = []
        } = getTransformedAttributeParts(nodeProps);
        const allDirectives = [
          ...baseDirectives,
          ...directives
        ];
        // Process the directives.
        const {
          tagname: newTagname = '',
          props: newProps = {},
          children: newChildren = []
        } = processDirectives(node, allDirectives, uuid);
        // TRICKY: Run again to get new attribute values.
        const {
          customAttributeString,
          newAttribs: modifiedProps = {}
        } = getTransformedAttributeParts(newProps);
        const attribList = !!customAttributeString ? [customAttributeString] : [];
        const props = tagname === 'symbol' ?
          {
            ...modifiedProps,
            // TRICKY: Don't mess with symbol ids.
            id: originalAttrsId
          } :
          modifiedProps;

        tagname = newTagname;
        children = newChildren;

        for (const k in props) {
          if (props.hasOwnProperty(k)) {
            let attrValue = tagname === 'glyph' && k === 'unicode' ?
              ENTITIES.encode(props[k]) :
              props[k];

            if (typeof attrValue === 'string') {
              attribList.push(`${k}="${attrValue}"`);
            } else {
              attribList.push(`${k}={${JSON.stringify(attrValue)}}`);
            }
          }
        }

        const attribSpacer = attribList.length > 0 ? ' ' : '';

        html.push(`<${tagname}${attribSpacer}${attribList.join(' ')}`);

        if (!VOID_HTML_ELEMENT_MAP[node.name]) {
          html.push('>');
          if (children instanceof Array) {
            html.push(jsonToSVG(children, uuid));
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

  const uuid = `_${UUIDV4()}`;
  const {
    props: {
      className = '',
      ...svgProps
    },
    ...svgNode
  } = JSON.parse(source);
  const cleanClassName = className instanceof Array ? className : className.split(' ');
  const newClassName = [
    uuid,
    ...cleanClassName
  ];
  const newSVGNode = {
    ...svgNode,
    props: {
      ...svgProps,
      className: newClassName.join(' '),
      // TRICKY: Use symbols.
      xmlnsXlink: 'http://www.w3.org/1999/xlink'
    }
  };
  const newSVGString = jsonToSVG([newSVGNode], uuid);

  return `
  import React from 'react';
  
  export const UUID = '${uuid}';
  
  export default (props = {}) => (
    ${newSVGString}
  );
  `;
}

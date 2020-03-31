import Path from 'path';
import Flat from 'flat';

export const includeParentLevels = (dirName = '', structure = {}) => {
  const relativePath = Path.relative(
    Path.join(__dirname, 'src'),
    dirName
  );

  if (!!relativePath) {
    const flatObj = {
      [relativePath]: structure
    };

    return Flat.unflatten(flatObj, { delimiter: '/' });
  } else {
    return structure;
  }
};

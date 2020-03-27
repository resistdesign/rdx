import Path from 'path';
import Flat from 'flat';

export const includeParentLevels = (dirName = '', structure = {}) => {
  const relativePath = Path.relative(
    Path.join(__dirname, 'src'),
    dirName
  );
  const flatObj = {
    [relativePath]: structure
  };

  return Flat.unflatten(flatObj, { delimiter: '/' });
};

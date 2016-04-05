import Path from 'path';
import Glob from 'glob';

export default function (path, contextPath, outputPath, asObject = false) {
  let target = asObject ? {} : [];
  let paths = [];
  try {
    const pathPattern = Path.join(
      path,
      '**/*.js'
    );
    paths = Glob.sync(pathPattern);
  } catch (error) {
    return target;
  }

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];

    try {
      const func = require(p);
      const value = func(contextPath, outputPath);

      if (asObject) {
        target = {
          ...target,
          ...value
        };
      } else {
        target = [
          ...(target || []),
          ...(value || [])
        ];
      }
    } catch (error) {
      // Ignore.
    }
  }

  return target;
}

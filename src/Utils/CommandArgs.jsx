import { flatten, unflatten } from 'flat';

const FLAT_OPTIONS = {
  maxDepth: Infinity
};

export const getMergedInput = (...items) => items.reduce(
  (acc, item) => unflatten(
    {
      ...flatten(acc, FLAT_OPTIONS),
      ...flatten(item, FLAT_OPTIONS)
    },
    FLAT_OPTIONS
  ),
  {}
);

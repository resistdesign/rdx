import { flatten, unflatten } from 'flat';

const FLAT_OPTIONS = {
  maxDepth: Infinity
};

export const getMergedInput = (...items) => unflatten(
  items.reduce(
    (acc, item) => ({
      ...acc,
      ...flatten(item, FLAT_OPTIONS)
    }),
    {}
  ),
  FLAT_OPTIONS
);

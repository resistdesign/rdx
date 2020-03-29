import { flatten, unflatten } from 'flat';

export const getMergedInput = (...items) => unflatten(
  items.reduce((acc, item) => ({ ...acc, ...flatten(item) }), {})
);

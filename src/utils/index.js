import { isDraftable, produce } from 'immer';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';
import lGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import lazy from './lazy';

export * from './tests';

function asImmer(value) {
  try {
    return produce(value, (draft) => draft);
  } catch (err) {
    return value;
  }
}

export {
  lazy, produce, isEqual, uniq, lGet, sortBy, asImmer,
};

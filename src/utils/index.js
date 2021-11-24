import { isDraftable, produce } from 'immer';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';
import lGet from 'lodash/get';
import sortBy from 'lodash/sortBy';
import lazy from './lazy';

const isNumber = require('lodash/isNumber');

export * from './tests';

export {
  lazy, produce, isEqual, uniq, lGet, sortBy, isNumber,
};

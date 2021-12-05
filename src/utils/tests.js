import { ABSENT, NAME_UNNAMED } from '../constants';

const isNum = require('lodash/isNumber');

export const isNumber = isNum;

export function isThere(item) {
  return ![ABSENT, NAME_UNNAMED, undefined].includes(item);
}

/**
 * returns true if the object is a POJO object -- that is,
 * its non-null, is an instance of Object, and is not an array.
 *
 * @param o
 * @returns {boolean}
 */
export function isObj(o) {
  return o && (typeof o === 'object') && (!Array.isArray(o)) && (!(o instanceof Map));
}

/**
 * a type check; if nonEmpty = true, only true if array has indexed values.
 * @param a
 * @param nonEmpty
 * @returns {boolean}
 */
export function isArr(a, nonEmpty = false) {
  return Array.isArray(a) && (!nonEmpty || a.length);
}

export const isMap = (m) => m && (m instanceof Map);

export const isFn = (f) => typeof f === 'function';

export const e = (err, notes = {}) => {
  if (typeof err === 'string') {
    err = new Error(err);
  }
  if (!isThere(notes)) {
    notes = {};
  } else if (!isObj(notes)) {
    notes = { notes };
  }
  return Object.assign(err, notes);
};

export function isStr(s, nonEmpty = false) {
  if (typeof s === 'string') {
    return nonEmpty ? !!s : true;
  }
  return false;
}

/**
 * returns a POJO object equivalent to the input;
 * or the input itself if force !== true;
 * If a map is passed, its keys are forced into a POJO; unusable keys
 * are silently skipped.
 *
 * @param m
 * @param force {boolean} returns a clone of an input object; otherwise is a noop for POJOS
 * @returns {Object}
 */
export function toObj(m, force = false) {
  if (!(isObj(m) || isMap(m))) {
    throw Object.assign(new Error('cannot convert target to object'), { target: m });
  }
  let out = m;
  if (isObj(m)) {
    if (force) {
      out = { ...m };
    }
  } else if (isMap(m)) {
    out = {};
    m.forEach((val, key) => {
      if (!((typeof key === 'number') || (typeof key === 'string'))) {
        return;
      }
      try {
        out[key] = val;
      } catch (e) {
        console.warn('toObj map/object conversion -- skipping exporting of child key', key, 'of ', m);
      }
    });
  }

  return out;
}

export function isWhole(value) {
  if (!isNumber(value)) return false;
  return (value >= 0) && !(value % 2);
}

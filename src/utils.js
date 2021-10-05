import { isDraftable, produce } from 'immer';
import { ABSENT, NAME_UNNAMED } from './constants';

const isNumberLodash = require('lodash/isNumber');

export function asMap(m, force) {
  if (m instanceof Map) {
    return force ? new Map(m) : m;
  }
  const map = new Map();
  Object.keys(m)
    .forEach((key) => map.set(key, m[key]));
  return map;
}

/** * ****************** INTROSPECTION ****************** */

/**
 * note - the tests isObject, isArray, isMap are EXCLUSIVE
 * - only one (or none) of them should test true
 * for any given target
 */

/**
 * returns true if the object is a POJO object -- that is,
 * its non-null, is an instance of Object, and is not an array.
 *
 * @param o
 * @returns {boolean}
 */
export function isObject(o) {
  return o && (typeof o === 'object') && (!Array.isArray(o)) && (!(o instanceof Map));
}

/**
 * a type check; if nonEmpty = true, only true if array has indexed values.
 * @param a
 * @param nonEmpty
 * @returns {boolean}
 */
export function isArray(a, nonEmpty = false) {
  return Array.isArray(a) && (!nonEmpty || a.length);
}

export const isMap = (m) => m && (m instanceof Map);

export const isFunction = (f) => typeof f === 'function';

export const e = (err, notes = {}) => {
  if (typeof err === 'string') err = new Error(err);
  return Object.assign(err, notes);
};

export function isString(s, nonEmpty = false) {
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
export function asObject(m, force = false) {
  if (!(isObject(m) || isMap(m))) {
    throw Object.assign(new Error('cannot convert target to object'), { target: m });
  }
  let out = m;
  if (isObject(m)) {
    if (force) out = { ...m };
  } else if (isMap(m)) {
    out = {};
    m.forEach((val, key) => {
      if (!((typeof key === 'number') || (typeof key === 'string'))) {
        return;
      }
      try {
        out[key] = val;
      } catch (e) {
        console.warn('asObject map/object conversion -- skipping exporting of child key', key, 'of ', m);
      }
    });
  }

  return out;
}

export function asUserAction(str) {
  if (typeof str !== 'string') throw new Error('bad user action');

  while (str.substr(0, 2) !== '$$') str = `$${str}`;
  return str;
}

export const noop = (n) => n;

export function maybeImmer(target) {
  if (!isDraftable(target)) return target;
  return produce(target, noop);
}

export const isNumber = isNumberLodash;

/**
 * returns true unless item is ABSENT or undefined;
 *
 * @param item {any}
 * @returns {boolean}
 */
export function present(item) {
  return ![ABSENT, NAME_UNNAMED, undefined].includes(item);
}

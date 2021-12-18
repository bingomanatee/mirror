import { isMap, isObj, isStr, isNumber } from './tests';

export function toMap(m, force) {
  if (m instanceof Map) {
    return force ? new Map(m) : m;
  }
  const map = new Map();
  Object.keys(m)
    .forEach((key) => map.set(key, m[key]));
  return map;
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
      if (!(isNumber(val) || isStr(val, true))) {
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

import { BehaviorSubject } from 'rxjs';

export function asMap(m, force) {
  if (m instanceof Map) {
    return force ? new Map(m) : m;
  }
  const map = new Map();
  Object.keys(m)
    .forEach((key) => map.set(key, m[key]));
  return map;
}

export function isObject(o) {
  return o && (typeof o === 'object');
}

export function isMap(m) {
  return m && (m instanceof Map);
}

export function asObject(m, force) {
  if (!(m instanceof Map)) return force ? { ...m } : m;
  const out = {};
  m.forEach((val, key) => {
    try {
      out[key] = val;
    } catch (e) {
    }
  });
  return out;
}

export function asUserAction(str) {
  if (typeof str !== 'string') throw new Error('bad user action');

  while (str.substr(0, 2) !== '$$') str = `$${str}`;
  return str;
}

export function hasOrIs(target, value) {
  if (target === value) return true;
  if (!(target instanceof BehaviorSubject)) return false;
  return target.value === value;
}

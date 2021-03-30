export function asMap(m) {
  if (m instanceof Map) {
    return new Map(m);
  }
  const map = new Map();
  Object.keys(m)
    .forEach((key) => map.set(key, m[key]));
  return map;
}

export function asObject(m) {
  if (!(m instanceof Map)) return m;
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

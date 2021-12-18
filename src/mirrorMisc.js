import { SET_RE, TYPE_MAP, TYPE_OBJECT } from './constants';
import { ucFirst, isStr } from './utils';

function makeDoObj(target) {
  const obj = {};
  target.$_actions.forEach((fn, name) => {
    try {
      obj[name] = fn;
    } catch (e) {

    }
  });

  switch (target.$type) {
    case TYPE_OBJECT:
      Object.keys(target.value)
        .forEach((key) => {
          const setKey = `set${ucFirst(key)}`;
          obj[setKey] = (value) => target.$set(key, value);
        });
      break;

    case TYPE_MAP:
      target.value.keys()
        .forEach((key) => {
          const setKey = `set${ucFirst(key)}`;
          obj[setKey] = (value) => target.$set(key, value);
        });
      break;
  }

  return obj;
}

export function makeDoProxy(target) {
  if (target.$_doProxy) {
    return target.$_doProxy;
  }
  if (typeof Proxy === 'undefined') {
    return makeDoObj(target);
  }

  return new Proxy(target, {
    get(proxyTarget, name) {
      if (proxyTarget.$_actions.has(name)) {
        return proxyTarget.$_actions.get(name);
      }

      if (isStr(name)) {
        const match = name.match(SET_RE);
        if (match) {
          const [_whole, key] = match;
          if (proxyTarget.$keyFor(key)) {
            return (value) => proxyTarget.$set(key, value);
          }
        }
      }

      return () => {
        throw new Error(`no action named ${name}`);
      };
    },
  });
}

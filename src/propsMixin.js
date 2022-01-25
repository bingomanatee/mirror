import { TYPE_ARRAY, TYPE_MAP, TYPE_OBJECT, } from './constants';
import { clone, e, getKey, isFn, isObj, isStr, isWhole, produce, setKey, toMap, typeOfValue, } from './utils';

export default (BaseClass) => class WithProps extends BaseClass {
  constructor(val, config, ...args) {
    super(val, config, ...args);

    this.$_configProps(config);

    if (this.$_hasSelectors) {
      this.next(this.$_withSelectors(this.value));
    }
  }

  $_configProps(config) {
    if (!isObj(config)) {
      return;
    }

    const { fixed, selectors } = config;
    this.$isFixed = !!fixed;

    if (selectors) {
      toMap(selectors).forEach((fn, name) => {
        if (isFn(fn) && isStr(name, true)) {
          this.$addSelector(name, fn);
        }
      });
    }
  }

  get $type() {
    return typeOfValue(this.getValue());
  }

  $set(key, value) {
    const myKey = this.$keyFor(key);

    let next = this.$_mutable ? clone(this.value) : this.value;

    if (this.$_mutable) {
      setKey(next, myKey, value);
    } else {
      next = produce(next, (draft) => {
        setKey(draft, myKey, value);
      });
    }
    this.next(next);
  }

  $keyFor(key) {
    const keyLC = `${key}`.toLowerCase();
    let out = key;

    switch (this.$type) {
      case TYPE_OBJECT:
        if (key in this.value) {
          out = key;
        } else {
          out = Array.from(Object.keys(this.value))
            .reduce((keyFor, objKey) => {
              if (`${objKey}`.toLowerCase() === keyLC) {
                return objKey;
              }
              return keyFor;
            }, key);
        }
        break;

      case TYPE_MAP:
        if (this.value.has(key)) {
          out = key;
        } else {
          out = Array.from(this.value.keys())
            .reduce((keyFor, objKey) => {
              if (`${objKey}`.toLowerCase() === keyLC) {
                return objKey;
              }
              return keyFor;
            }, key);
        }

        break;

      case TYPE_ARRAY:
        if (isWhole(key)) {
          out = key;
        } else {
          throw e('non-whole key for array', { key });
        }
        break;
    }

    return out;
  }

  $addSelector(name, fn) {
    this.$_selectors.set(name, fn);
  }

  get $_selectors() {
    if (!this.$__selectors) {
      this.$__selectors = new Map();
    }

    return this.$__selectors;
  }

  get $_hasSelectors() {
    return this.$__selectors && this.$__selectors.size > 0;
  }

  $get(key) {
    return getKey(this.value, key);
  }

  $_withSelectors(value) {
    if (!this.$_hasSelectors) return value;
    const target = this;
    const valueType = typeOfValue(value);

    if (this.$_mutable) {
      const out = clone(value);
      this.$_selectors.forEach((fn, name) => {
        try {
          const selValue = fn(value, target, name);
          setKey(out, name, selValue, valueType);
        } catch (err) {
          console.warn('cannot compute ', name, ':', err);
          setKey(out, name, {$error: err});
        }
      });
      return out;
    }
    return produce(value, (draft) => {
      target.$_selectors.forEach((fn, name) => {
        try {
          const selValue = fn(value, target, name);
          setKey(draft, name, selValue, valueType);
        } catch (err) {
          console.warn('cannot compute ', name, ':', err);
        }
      });
    });
  }
};

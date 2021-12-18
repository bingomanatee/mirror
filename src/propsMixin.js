import {
  EVENT_TYPE_SET, TYPE_ARRAY, TYPE_MAP, TYPE_OBJECT,
} from './constants';
import {
  toMap, isObj, isWhole, produce, typeOfValue, isFn, isStr,
} from './utils';

export default (BaseClass) => class WithProps extends BaseClass {
  constructor(val, config, ...args) {
    super(val, config, ...args);

    this.$_configProps(config);

    this.$on(EVENT_TYPE_SET, ({ key, value, allowNew = false }, evt, target) => {
      const myKey = target.$keyFor(key);
      if ((!allowNew) && (!myKey)) {
        evt.error(`bad key ${key}`);
        return;
      }

      evt.subscribe({
        complete() {
          let next = target.value;
          switch (target.$type) {
            case TYPE_OBJECT:
              next = produce(next, (draft) => {
                draft[myKey] = value;
              });
              break;

            case TYPE_MAP:
              next = produce(next, (draft) => {
                draft.set(myKey, value);
              });
              break;

            case TYPE_ARRAY:
              next = produce(next, (draft) => {
                draft[myKey] = value;
              });
              break;

            default:
              throw new Error('$set is not appropriate for this type of target');
          }
          target.next(next);
        },
        error() {
          // no action
        },
      });
    });

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
    const value = this.getValue();
    return typeOfValue(value);
  }

  $set(key, value) {
    switch (this.$type) {
      case TYPE_OBJECT:
        this.$send(EVENT_TYPE_SET, {
          key,
          value,
        }, true);
        break;

      case TYPE_MAP:
        this.$send(EVENT_TYPE_SET, {
          key,
          value,
        }, true);
        break;

      case TYPE_ARRAY:
        if (isWhole(key)) {
          this.$send({
            key,
            value,
          }, true);
        } else {
          throw new Error('bad key for array');
        }
        break;

      default:
        throw new Error('$set is not appropriate for this type of target');
    }
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
        }
        throw new Error('bad key for array');
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

  $_withSelectors(value) {
    if (!this.$_hasSelectors) return value;
    const target = this;
    const valueType = typeOfValue(value);
    const withSel = produce(value, (draft) => {
      target.$_selectors.forEach((fn, name) => {
        try {
          const selValue = fn(value, target, name);
          switch (valueType) {
            case TYPE_MAP:
              draft.set(name, selValue);
              break;

            case TYPE_OBJECT:
              draft[name] = selValue;
              break;

            case TYPE_ARRAY:
              draft[name] = selValue;
            default:
              // no set
          }
        } catch (err) {
          console.warn('cannot compute ', name, ':', err);
        }
      });
    });

    console.log('with selector: ', withSel);
    return withSel;
  }
};

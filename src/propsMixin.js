import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import {
  EVENT_TYPE_ACTION, EVENT_TYPE_NEXT, EVENT_TYPE_SET, TYPE_ARRAY, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import {
  isArr, isMap, isObj, isWhole, produce,
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
  }

  $_configProps(config) {
    if (!isObj(config)) {
      return;
    }

    const { fixed } = config;
    this.$isFixed = !!fixed;
  }

  get $type() {
    const value = this.getValue();
    let type = TYPE_VALUE;
    if (isMap(value)) {
      type = TYPE_MAP;
    }
    if (isArr(value)) {
      type = TYPE_ARRAY;
    }
    if (isObj(value)) {
      type = TYPE_OBJECT;
    }
    return type;
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
};

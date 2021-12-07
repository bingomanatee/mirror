import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import {
  EVENT_TYPE_ACTION, EVENT_TYPE_NEXT, TYPE_MAP, TYPE_OBJECT,
} from './constants';
import {
  isArr, isObj, sortBy, typeOfValue, hasKey, getKey,
} from './utils';

export default (BaseClass) => class WithChildern extends BaseClass {
  constructor(value, config, ...args) {
    super(value, config, ...args);

    config && this.$_configChildren(config);

    this.$on(EVENT_TYPE_NEXT, (value, evt, target) => {
      if (!target.$_hasChildren) {
        return;
      }

      const valueType = typeOfValue(value);

      target.$children.forEach((child, key) => {
        if (hasKey(value, key, valueType)) {
          const childValue = getKey(value, key, valueType);
          child.$send(EVENT_TYPE_NEXT, childValue, true);
        }
      });
    });
  }

  get $children() {
    return lazy(this, '$_children', () => (new Map()));
  }

  get $_hasChildren() {
    return !!this.$_children && this.$children.size;
  }

  $addChild(key, child) {
    child.$parent = this;
    this.$children.set(key, child);
  }

  $_configChildren(config) {
    if (!isObj(config)) {
      return;
    }

    const { children } = config;

    if (children) {
      switch (typeOfValue(children)) {
        case TYPE_OBJECT:

          Object.keys(children).forEach((key) => {
            const child = children[key];
            this.$addChild(key, child);
          });

          break;

        case TYPE_MAP:
          children.forEach((child, key) => {
            this.$addChild(key, child);
          });
          break;

        default:
          console.warn('strange child type ', children);
      }
    }
  }
};

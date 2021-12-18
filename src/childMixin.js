import {
  ABSENT,
  EVENT_TYPE_NEXT, EVENT_TYPE_REMOVE_FROM, TYPE_MAP, TYPE_OBJECT,
} from './constants';
import {
  isObj, typeOfValue, hasKey, getKey, setKey, produce, isEqual,
} from './utils';

export default (BaseClass) => class WithChildren extends BaseClass {
  constructor(value, config, ...args) {
    super(value, config, ...args);

    config && this.$_configChildren(config);

    this.$on(EVENT_TYPE_NEXT, (value, evt, target) => {
      if (!target.$_hasChildren) {
        return;
      }

      const valueType = typeOfValue(value);

      target.$children.forEach((child, key) => {
        if (evt.hasError) return;
        if (hasKey(value, key, valueType)) {
          const childValue = getKey(value, key, valueType);
          target.$note('sending child value:', { key, childValue });
          if (child.value === childValue || isEqual(child.value, childValue)) return;
          const childEvt = child.$send(EVENT_TYPE_NEXT, childValue, true);
          if (childEvt.hasError) {
            evt.error({
              error: childEvt.thrownError,
              target: key,
            });
            child.$send(EVENT_TYPE_REMOVE_FROM, childEvt.$order);
          }
        } else {
          target.$note('not updating child ', { key });
        }
      });
    });
  }

  get $root() {
    if (this.$parent) {
      return this.$parent.$root;
    }
    return this;
  }

  get $children() {
    if (!this.$_children) {
      this.$_children = new Map();
    }
    return this.$_children;
  }

  get $_hasChildren() {
    return !!this.$_children && this.$children.size;
  }

  $addChild(key, child) {
    child.$parent = this;
    child.$name = key;
    this.$children.set(key, child);
  }

  $_withChildValues(value = ABSENT) {
    if (value === ABSENT) {
      value = this._value;
    }

    const type = typeOfValue(value);

    if (this.$_hasChildren) {
      this.$children.forEach((child, key) => {
        const childValue = child.value;

        if (getKey(value, key, type) !== childValue) {
          value = produce(value, (draft) => {
            setKey(draft, key, childValue, type);
          });
        }
      });
    }

    return value;
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

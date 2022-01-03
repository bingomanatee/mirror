import {
  ABSENT,
  EVENT_TYPE_NEXT, EVENT_TYPE_REMOVE_FROM, EVENT_TYPE_VALIDATE, TYPE_ARRAY, TYPE_MAP, TYPE_OBJECT,
} from './constants';
import {
  isObj, typeOfValue, hasKey, getKey, setKey, produce, isEqual,
} from './utils';

export default (BaseClass) => class WithChildren extends BaseClass {
  constructor(value, config, ...args) {
    super(value, config, ...args);

    config && this.$_configChildren(config);

    this.$on(EVENT_TYPE_NEXT, (nextValue, evt, target) => {
      if (!target.$_hasChildren) {
        return;
      }

      const valueType = typeOfValue(nextValue);

      target.$children.forEach((child, key) => {
        if (evt.hasError) {
          return;
        }
        if (hasKey(nextValue, key, valueType)) {
          const childValue = getKey(nextValue, key, valueType);
          if (child.value === childValue || isEqual(child.value, childValue)) {
            return;
          }
          const changeEvent = child.$send(EVENT_TYPE_NEXT, childValue, true);
          if (!changeEvent.hasError) {
            child.$send(EVENT_TYPE_VALIDATE, changeEvent);
          } else {
            child.$send(EVENT_TYPE_REMOVE_FROM, changeEvent.$order);
            evt.error({
              error: changeEvent.thrownError,
              target: key,
            });
          }
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
    const target = this;
    this.$children.set(key, child);
    child.subscribe({
      next(value) {
        if (target.$lastChange) {
          const lastValueChildValue = getKey(target.$lastChange.value, key);
          if (lastValueChildValue !== value) {
            try {
              setKey(target.$lastChange.value, key, value);
            } catch (err) {
              target.$lastChange.value = produce(target.$lastChange.value, (draft) => {
                setKey(draft, key, value);
              });
            }
          }
        } else {
          const childValue = getKey(target.value, key);
          if (childValue !== value) {
            target.next(produce(target.value, (draft) => {
              setKey(draft, key, value);
            }));
          }
        }
      },
    });
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

          Object.keys(children)
            .forEach((key) => {
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

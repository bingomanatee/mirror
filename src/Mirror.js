import { BehaviorSubject, Subject } from 'rxjs';
import {
  ABSENT,
  NAME_UNNAMED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import {
  asMap, hasOrIs, isMap, isObject,
} from './utils';


export default class Mirror extends BehaviorSubject {
  constructor(value, config) {
    super(value);
    this.$_parseConfig(config);
    this.$_setType();
    this.$_shard();
    this.$_constructed = true;
  }

  $_parseConfig(config) {
    this.$_name = NAME_UNNAMED;
    if (isObject(config)) {
      Object.keys(config)
        .forEach((key) => {
          switch (key.toLowerCase()) {
            case 'children':
              this.$addChildren(config[key]);
              break;

            case 'type':
              this.$_setType(config[key]);
              break;

            case 'name':
              this.$_setName(config[key]);
              break;

            default:
              console.warn('unknown config field ', key);
          }
        });
    }
  }

  get name() {
    return this.$_name;
  }

  $_setName(newName) {
    this.$_name = newName;
  }

  $addChildren(collection) {
    asMap(collection)
      .forEach((child, name) => this.$addChild(name, child));
  }

  $hasChild(key, value = ABSENT) {
    if (!this.$_children || !this.$children.has(key)) {
      return false;
    }

    if (value === ABSENT) return true; // don't care what the child's value is -- just that it exists

    const child = this.$children.get(key);

    return hasOrIs(child, value);
  }

  /**
   * note - acceptable children are either full-fledged Mirrors themselves
   * or RXJS BehaviorSubjects -- they ar required to have a current value always, and be subscribable.
   * ideally are mirrors so they have the full validation suite.
   *
   * @param name {any}
   * @param value {any}
   * @returns {Mirror}
   */
  $addChild(name, value) {
    switch (this.$type) {
      case TYPE_MAP:
        if (this.$hasChild(name, value)) {
          return this;
        }
        // any keys are acceptable
        break;

      case TYPE_VALUE:
        throw new Error('cannot add children to a value Mirror');
        // eslint-disable-next-line no-unreachable
        break;

      case TYPE_OBJECT:
        if (this.$hasChild(name, value)) {
          return this;
        }
        switch (typeof (name)) {
          case 'string':
            if (name === '') {
              throw new Error('cannot accept "" as a child key for a TYPE_OBJECT');
            }
            break;

          case 'number':
            // all numbers acceptable but wonky
            // eslint-disable-next-line no-param-reassign
            value = `${value}`;
            break;

          default:
            throw new Error('only strings, numbers acceptable as TYPE_OBJECT child keys');
        }
    }
    if (!(value instanceof BehaviorSubject)) {
      // eslint-disable-next-line no-param-reassign
      value = new Mirror(value);
    }
    // @TODO: prevent/warn renaming after constructor?
    this.$children.set(name, value); // @TODO: use an add event
    if (value instanceof Mirror) {
      value.$_setName(name);
    }
    return this;
  }

  get $children() {
    if (this.$type === TYPE_VALUE) {
      console.warn('attempt to get the children of a TYPE_VALUE Mirror');
      return null;
    }
    if (!this.$_children) this.$_children = new Map();
    return this.$_children;
  }

  /**
   * Mirrors are either collective nodes -- TYPE_OBJECT/TYPE_MAP --
   * in which case their value is a dynamic snapshot of their children --
   * or TYPE_VALUE -- in which case their value is stored/retrieved as is conventional for
   * BehaviorSubjects.
   *
   * @returns {TYPE_MAP|TYPE_OBJECT|TYPE_VALUE}
   */
  get $type() {
    return this.$_type;
  }

  $_setType(type) {
    if (this.$_type) {
      if (this.$_constructed) {
        console.error('cannot redefine the type of ', this.name, 'from ', this.$type);
      }
      return;
    }
    if (type) {
      this.$_type = type;
      return;
    }
    if (isMap(this.value)) {
      this.$_type = TYPE_MAP;
      this.$_shard();
    } else if (isObject(this.value)) {
      this.$_type = TYPE_OBJECT;
      this.$_shard();
    } else {
      this.$_type = TYPE_VALUE;
    }
  }

  $_shard() {
    if (this.$_constructed) {
      throw new Error('not presently allowed to shard after constructor');
    }
    if (this.$type === TYPE_VALUE) return;
    this.$addChildren(this.value);
  }
}

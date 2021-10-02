/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, Subject } from 'rxjs';
import { enableMapSet, immerable, isDraft, produce } from 'immer';
import sortBy from 'lodash/sortBy';

enableMapSet();
import {
  ABSENT, MUTATOR,
  NAME_UNNAMED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import {
  asMap, asObject, hasOrIs, isMap, isObject, noop, maybeImmer, e, isFunction
} from './utils';
import { addChild, hasChild, mirrorHas, removeChild, setParent, updateChildren } from './childParentUtils';
import ChangeEvent from './ChangeEvent';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, config) {
    super(maybeImmer(value));

    this.$_parseConfig(config);
    if (!this.$_type) {
      if (isMap(value)) {
        this.$_type = TYPE_MAP;
      } else if (isObject(value)) {
        this.$_type = TYPE_OBJECT;
      } else {
        this.$_type = TYPE_VALUE;
      }
    }

    if (this.$isCollection) {
      this.$_shard(value);
    }
    this.$_constructed = true;
  }

  $_parseConfig(config) {
    this.$_name = NAME_UNNAMED;
    this.$_debug = false;

    if (isObject(config)) {
      Object.keys(config)
        .forEach((key) => {
          const fieldValue = config[key];
          switch (key.toLowerCase()) {
            case 'children':
              this.$addChildren(fieldValue);
              break;

            case 'type':
              this.$_type = fieldValue;
              break;

            case 'name':
              this.$_setName(fieldValue);
              break;

            case 'lockChildren':
              this.$_lockFields = !!fieldValue;
              break;

            case 'debug':
              this.$_debug = fieldValue;

            case 'validator':
              if (isFunction(fieldValue)) {
                this.$addValidator(fieldValue);
              }
            default:
              this.$_log(0, 'unknown config field ', { key });
          }
        });
    }
  }

  get $name() {
    return this.$_name;
  }

  $_setName(newName) {
    this.$_name = newName;
  }

  /*** *********** VALIDATION  *********** */

  $addValidator(fn, order = 0, name = ABSENT) {
    if (!this.$_validators) {
      this.$_validators = [];
    }
    this.$_validators = sortBy([...this.$_validators, {
      fn,
      order,
      inserted: this.$_validators.length,
      name
    }], 'order', 'inserted');
  }

  get $hasValidators() {
    return this.$_validators && this.$_validators.length;
  }

  $errors(nextValue = ABSENT) {
    if (!this.$hasValidators) {
      return false;
    }
    return this.$invalid(nextValue === ABSENT ? this.value : nextValue);
  }

  /**
   * returns false if there is no errors;
   * returns an array of errors if present
   * @param value
   */
  $invalid(value) {
    if (!this.$hasValidators) {
      return false;
    }
    let errors = [];
    const target = this;
    this.$_validators.forEach(({
      fn,
      name
    }) => {
      let error = fn(value, target, name, errors);
      if (error) errors.push(error);
    });
    if (!errors.length) return false;
    return errors;
  }

  /*** *********** TYPE  *********** */

  /**
   * Mirrors are either collective nodes -- TYPE_OBJECT/TYPE_MAP --
   * in which case their value is a dynamic snapshot of their children --
   * or TYPE_VALUE -- in which case their value is stored using the standard
   * BehaviorSubject system.
   *
   * TYPE_VALUE means the value is not sharded amongst children
   * but is stored as a single value.
   * It _MAY IN FACT_ be an object, or a Map, array or even a class instance --
   * the only absolute known feature is that it is immerable.
   * its mirror will not utilize/observe/add/remove children.
   *
   * @returns {TYPE_MAP|TYPE_OBJECT|TYPE_VALUE}
   */
  get $type() {
    return this.$_type;
  }

  get $isCollection() {
    return [TYPE_OBJECT, TYPE_MAP].includes(this.$type);
  }

  get $isValue() {
    return this.$type === TYPE_VALUE;
  }

  /*** *********** PARENT ********** */

  get $parent() {
    return this.$_parent || null;
  }

  $setParent(newParent) {
    setParent(newParent, this, Mirror);
  }

  /*** *********** CHILDREN MANAGERS *********** */
  $lock(lock = true) {
    this.$_lockFields = lock;
  }

  get $locked() {
    return !!this.$_lockFields;
  }

  $addChildren(collection) {
    asMap(collection)
      .forEach((child, name) => this.$addChild(name, child));
  }


  /**
   * returns true if:
   *
   * 1) value is absent and key is a valid child
   * 2) value is present and is (the mirror that)  is stored in this.$children.get(key);
   * 3) value is present and is the VALUE OF THE MIRROR that is stored in this.$children.get(key);
   *
   * @param key {any}
   * @param value {any|Mirror}
   * @returns {boolean}
   */
  $hasChild(key, value = ABSENT) {
    return hasChild(key, value, this);
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
    addChild(name, value, this, Mirror);
    return this;
  }

  /**
   * a registry of the listener subs for all my children
   * @returns {Map}
   */
  get $_childSubs() {
    if (!this.$__childSubs) {
      this.$__childSubs = new Map();
    }
    return this.$__childSubs;
  }

  /**
   * removes a child from a mirror.
   * @param name {any|Mirror} the name of the children in the children collection --
   * -- or a value in the children collection
   */
  $removeChild(name) {
    removeChild(name, this, Mirror);
    return this;
  }

  /**
   * $children is a map of <key, BehaviorSubject | Mirror>;
   * 99% of the time its values are Mirrors.
   * The only exception is if the configuration
   * deliberately passes a BehaviorSubject as a child; this allows for interfacing
   * with the broader RxJS ecosystem.
   * @returns {Map<any, Mirror|BehaviorSubject>}
   */
  get $children() {
    if (this.$type === TYPE_VALUE) {
      this.$_log(1, 'attempt to get the children of a TYPE_VALUE Mirror');
      return null;
    }
    if (!this.$_children) this.$_children = new Map();
    return this.$_children;
  }

  get $keys() {
    if (!(this.$isCollection && this.$_children)) {
      return new Set();
    }
    return new Set(Array.from(this.$children.keys()));
  }

  $get(field) {
    if (this.$isValue) {
      console.warn('cannot get a member of a TYPE_VALUE mirror');
      return undefined;
    }

    if (!this.$has(field)) {
      this.$_log(0, 'attempt to get non-present child', { field });
      return undefined;
    }
    return this.$children.get(field).value;
  }

  /**
   * returns the mirror that manages a particular child
   * @param field
   * @returns {Mirror|BehaviorSubject|undefined}
   */
  $getChild(field) {
    if (this.$isValue) {
      console.warn('cannot get a member of a TYPE_VALUE mirror');
      return undefined;
    }

    if (!this.$has(field)) {
      this.$_log(0, 'attempt to get non-present child', { field });
      return undefined;
    }
    return this.$children.get(field);
  }

  $set(alpha, value) {
    if (this.$type === TYPE_VALUE) {
      this.next(alpha);
      return;
    }

    if (this.$has(alpha)) {
      this.$children.get(alpha)
        .next(value);
    } else {
      if (this.$_lockFields) {
        if (this.$_constructed) {
          console.warn('attempt to set child', alpha,
            'of a field- locked Mirror', this);
        }
      } else {
        this.$addChild(alpha, value);
      }
    }
  }

  /**
   * a very simple check on the child keys.
   * @param field {any}
   * @returns {boolean}
   */
  $has(field) {
    return mirrorHas(field, this);
  }

  $_shard(newValue = ABSENT) {
    if (this.$_constructed) {
      if (newValue === ABSENT) {
        throw new Error('not presently allowed to shard after constructor');
      }
      this.$updateChildren(newValue);
    }
    if (!this.$isCollection) {
      console.warn('cannot shard TYPE_VALUE Mirrors');
    }
    this.$addChildren(newValue === ABSENT ? this.value : newValue);
  }

  $updateChildren(value) {
    updateChildren(value, this);
    return this;
  }

  /*** ***************** MUTATIONS, PENDING UPDATES ************** */

  /**
   * transforms the 'immered' value; warning, this should be the end product
   * of updating children; manually mutating the value of a Mirror may break
   * mirror/child consistency
   * @param fn {function}
   */
  $_mutate(fn) {
    if (!isFunction(fn)) {
      throw e('non-function passed to $_mutate', {
        target: this,
        fn
      });
    }
    const self = this;
    const nextEvent = new ChangeEvent(self, new Map([[MUTATOR, fn]]));
    const sub = nextEvent.subscribe({
      error() {
        self.$_removePendingUpdate(nextEvent);
      },
      complete() {
        super.next(produce(this.value, fn));
      }
    })
    this.$_addPendingUpdate(nextEvent);

    return { nextEvent, sub };
  }

  $_addPendingUpdate(changeEvent) {
    if (!this.$__pendingUpdates) {
      this.$__pendingUpdates = [changeEvent]
    } else {
      this.$__pendingUpdates.push(changeEvent);
    }
    this.$_processPendingUpdate(changeEvent);
  }

  /**
   *
   * @param changeEvent {ChangeEvent}
   */
  $_processPendingUpdate(changeEvent) {
    if (changeEvent.isStopped) {
      this.$_removePendingUpdate(changeEvent);
    }
    let nextValue = changeEvent.value;
    if (isMap(nextValue) && isFunction(nextValue.get(MUTATOR))) {
      nextValue = nextValue.get(MUTATOR)(this.value, this);
    } // else nextValue is the proper value
    let errors = this.$invalid(nextValue);
    if (errors) {
      changeEvent.error(errors);
    } else {
      changeEvent.complete();
    }
  }

  /**
   * remove a changeEvent from the queue;
   * this can be because it has failed
   * OR succeeded.
   * @param changeEvent
   */
  $_removePendingUpdate(changeEvent) {
    if (this.$__pendingUpdates && this.$__pendingUpdates.includes(changeEvent)) {
      this.$__pendingUpdates = this.$__pendingUpdates.filter((e => e !== changeEvent));
    }
  }

  /**
   * update the collections value with a single field change.
   *  note -- this is a final update utility - it shouldn't be
   *  called directly, only by the update manager.
   * @param name
   * @param value
   */
  $_updateField(name, value) {
    switch (this.$type) {
      case TYPE_OBJECT:
        this.$_mutate((draft) => {
          draft[name] = value;
        });
        break;

      case TYPE_MAP:
        this.$_mutate((draft) => {
          draft.set(name, value);
        });
        break;

      default:
        console.warn(
          'attempt to $_updateField', name, value,
          'on a Mirror of type ', this.$type, this
        );
    }
  }

  $_updateFields(collection) {
    const changes = asMap(collection);
    switch (this.$type) {
      case TYPE_OBJECT:
        let nextObject = { ...this.value };
        changes.forEach((value, field) => nextObject[field] = value);
        super.next(nextObject);
        break;

      case TYPE_MAP:
        const nextMap = new Map(this.value);
        changes.forEach((value, field) => nextMap.set(field, value));
        super.next(nextMap);
        break;

      default:
        console.warn(
          'attempt to $_updateFields', name, value,
          'on a Mirror of type ', this.$type, this
        );
    }
  }

  /*** *********** reducers *********** **/

  /**
   * returns the current value of the Mirror as an immer object.
   * OR, a POJO, if raw = true;
   * @param raw {boolean}
   * @returns {immer<Object>|Object}
   */
  $asObject(raw = false) {
    const out = {};
    this.$children.forEach((child, key) => {
      out[key] = child.value;
    });
    return produce(out, noop);
  }

  /**
   * returns the current value of the Mirror as an immer Map.
   * OR, a standard MAP, if raw = true;
   * @param raw {boolean}
   * @returns {immer<Map>|Map}
   */
  $asMap(raw = false) {
    const out = new Map();
    this.$children.forEach((child, key) => {
      out.set(key, child.value);
    });
    if (raw) return out;
    return produce(out, noop);
  }

  /*** *********** BehaviorSubject overrides *********** */

  next(nextValue) {
    if (this.$isCollection) {
      this.$updateChildren(nextValue);
    } else {
      this.$_mutate((current) => {
        return nextValue;
      });
    }
  }

  get value() {
    let out;
    switch (this.$type) {
      case TYPE_VALUE:
        out = super.value;
        break;

      case TYPE_OBJECT:
        out = this.$asObject();
        break;

      case TYPE_MAP:
        out = this.$asMap();
        break;

      default:
        out = super.value;
    }
    return out;
  }

  $_log(...args) {
    if (this.$_debug === false) return false;

    let n = 0;
    let message = '';
    let data = undefined;
    const alpha = args.shift();
    if (typeof alpha === 'number') {
      n = alpha;
      message = args.shift();
    } else {
      message = alpha;
    }

    if (args.length) {
      data = args;
    }

    if (typeof this.$_debug === 'number') {
      if (n > this.$_debug) return false;
    }

    console.log('--- logging -- n = ', n, 'log n = ', this.$_debug, 'msg = ', msg);
    console.warn(message, '(target:', this, ')', data);
  }

}

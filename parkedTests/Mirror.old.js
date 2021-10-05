/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, Subject } from 'rxjs';
import { enableMapSet, immerable, isDraft, produce } from 'immer';

enableMapSet();
import {
  ABSENT, CHILDREN,
  NAME_UNNAMED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import {
  asMap, asObject, isMap, isObject, noop, maybeImmer, e, isFunction, isArray, isNumber, present
} from './utils';
import { addChild, hasChild, mirrorHas, removeChild, setParent, updateChildren } from './childParentUtils';
import { hasOrIs, utilLogs, mirrorType, parseConfig } from './mirrorMisc';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, config) {
    super(maybeImmer(value));

    this.$_parseConfig(config);
    this.$_type = mirrorType(this, value);

    this.$_shard(value);
    this.$_constructed = true;
  }

  $_parseConfig(config) {
    parseConfig(this, config);
  }

  get $name() {
    return this.$_name;
  }

  /*** *********** VALIDATION  *********** */

  get $hasTests() {
    return this.$_tests && this.$_tests.length > 0;
  }

  get $tests() {
    if (!this.$_tests) {
      this.$_tests = new Set();
    }
    return this.$_tests;
  }

  $addTest(v, name = ABSENT) {
    if (name && typeof name === 'string') {
      if (this.$has(name)) {
        this.$children.get(name).$addTest(v);
      }
      if (name === CHILDREN) {
        this.$children.forEach(child => child.$addTest(v));
      }
    }

    if (isFunction(v)) {
      this.$tests.add(v);
    } else if (isArray(v) || isMap(v)) {
      v.forEach((vv, name) => this.$addTest(vv, name));
    } else {
      this.$_log(1, 'bad test -- did not add ', v);
    }
    return this;
  }

  /**
   * returns the error of any children, indexed by name.
   * @returns {boolean|Map<any, any>}
   */
  get $childErrors() {
    if (!this.$isCollection) {
      return false;
    }
    let errors = new Map();
    this.$children.forEach((child, name) => {
      if (child.$errors) {
        errors.set(name, child.$errors);
      }
    });
    if (errors.size) return errors;
    return false;
  }

  /**
   * returns false -- or if there are any errors, an array of the errors or thrown Errors.
   * @returns {boolean|[]}
   */

  get $errors() {
    if (this.$__errorSnapshot) {
      return this.$__errorSnapshot;
    }
    this.$__errorSnapshot = []
    this.$tests.forEach((fn) => {
      try {
        let output = fn(value, this);
        if (output) this.$__errorSnapshot.push(output);
      } catch (err) {
        this.$__errorSnapshot.push(err);
      }
    });

    if ((this.$__errorSnapshot.length)) {
      this.$_log(2, 'invalid value for test(s) ', {
        tests: this.$tests,
        value,
        errors
      });
      return this.$__errorSnapshot;
    }
    return false;
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

  $each(fn) {
    if (this.$isCollection) {
      this.$children.forEach((value, key) => fn(value, key, this));
    }
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

  /**
   * distributes a value to the children of the mirror; throws if constructed and new keys are added.
   * Ignores validation.
   *
   * @param newValue {collection | ABSENT}
   */
  $_shard(newValue = ABSENT, allowNewFields = false) {
    if(!this.$isCollection)
    {
      this.$_log('cannot shard TYPE_VALUE Mirrors');
      return;
    }
    if (this.$_constructed) {
      const newChildren = this.$updateChildren(newValue, allowNewFields);
      if (allowNewFields && newChildren.size) {
        this.$addChildren(newChildren);
      }
    } else {
      this.$addChildren(newValue === ABSENT ? this.value : newValue);
    }
    this._value = ABSENT;
  }

  /**
   * similar to setState; it updates the currently defined fields,
   * if the passed in collection (current value of mirror) has new fields,
   * either they are thrown (and no update occurs), or if returnNewFields is true,
   * they are returned as a map(and the current field set is updated.
   *
   * @param value {object|map|ABSENT} a set of name/value updates; if ABSENT, uses the mirrors current value.
   *
   * @param returnNewFields {boolean}
   * @returns {Map<*, V>|Map<*, *>}
   */
  $updateChildren(value = ABSENT, returnNewFields = false) {
    updateChildren(value, this, returnNewFields);
  }

  get $$pendingValue() {
    return this.$$_pendingValue;
  }

  set $$pendingValue(n) {
    this.$$_pendingValue = n;
    delete this.$_value;
  }

  $try(value) {
    this.$$pendingValue = value;
  }

  /**
   * purges any pending value from the tree, leaf-down, and finally, this item.
   */
  $revert(){
    if (this.$isCollection) {
      this.$each((child) => child.$revert());
    }
    this.$$pendingValue = ABSENT;
  }

  $commit() {
    this.$each((child) => {
      if (child && child.$commit) child.$commit;
    });
    if (present(this.$$pendingValue)) {
      this.$$pendingValue = ABSENT;
      if (this.$isCollection) {
        this.$_recompute();
      }
      super.next(this.value);
    }
  }

  /**
   * transforms the 'immered' value; warning, this should be the end product
   * of updating children; manually mutating the value of a Mirror may break
   * mirror/child consistency
   * @param fn {function}
   */
  $_mutate(fn) {
    let accepted = true;
    if (!isFunction(fn)) {
      throw e('non-function passed to $_mutate', {
        target: this,
        fn
      });
    }
    const nextValue = produce(this.value, fn);
    this.$try(nextValue);
    if (!(this.$errors || !this.$childErrors)) {
        this.$commit();
    } else {
      accepted = false;
      this.$revert(); // if it has not been passed onto next, reverts to previous value.
    }
    return accepted;
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
  //
  // $_updateFields(collection) {
  //   const changes = asMap(collection);
  //   switch (this.$type) {
  //     case TYPE_OBJECT:
  //       let nextObject = { ...this.value };
  //       changes.forEach((value, field) => nextObject[field] = value);
  //       super.next(nextObject);
  //       break;
  //
  //     case TYPE_MAP:
  //       const nextMap = new Map(this.value);
  //       changes.forEach((value, field) => nextMap.set(field, value));
  //       super.next(nextMap);
  //       break;
  //
  //     default:
  //       console.warn(
  //         'attempt to $_updateFields', name, value,
  //         'on a Mirror of type ', this.$type, this
  //       );
  //   }
  // }

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

  next(update) {
    if (this.$isValue) {
      this.$_mutate((draft) => update);
    } else {
      try {
        this.$updateChildren(update); // will call super.next via subscribers to children.
        this.$commit();
      } catch (err) {
        this.$revert();
      }
    }
  }

  $_recompute() {
    if (! this._value) {
      switch (this.$type) {
        case TYPE_OBJECT:
          this._value = this.asObject();
          break;
        case TYPE_MAP:
          this._value = this.$asMap();
          break;
      }
    }
    return this._value;
  }

  /**
   * note - unlike BS, mirrors retain their last value after completion.
   *
   * collections will compute dynamically until there is no pending value,
   * at which time they will return a cached value from $_value.
   *
   * @returns {unknown}
   */
  get value() {
    if (present(this.$$pendingValue)) {
      return this.$$pendingValue;
    }
    if (this.$isCollection) {
      if (!this._value) {
        this.$_recompute();
      }
    }
    return this._value;
  }

  /**
   * a polymorphic method with signatures ranging from:
   *
   * - msg, ...args
   * - msg, ...args
   * - n, msg ...args
   * - n, msg, ...args
   *
   * with N being the severity of the issue - the higher the more likely
   * the message is to be broadcast
   * msg being a string
   * any subsequent args being any optional output to the log
   *
   * @param args
   * @returns {boolean}
   */
  $_log(...args) {
    utilLogs(this, ...args);
  }
}

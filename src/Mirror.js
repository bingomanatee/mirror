/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, combineLatest, combineLatestWith, distinct, from, of, Subject } from 'rxjs';
import produce, { enableMapSet, isDraft } from 'immer';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

enableMapSet();
import {
  ABSENT,
  EVENT_TYPE_CHILD_ADDED,
  EVENT_TYPE_COMMIT,
  EVENT_TYPE_NEXT,
  EVENT_TYPE_REVERT,
  NAME_UNNAMED,
  STAGE_ERROR,
  STAGE_FINAL,
  STAGE_INIT,
  STAGE_PERFORM,
  STAGE_POST,
  STAGE_VALIDATE,
  TYPE_MAP,
  TYPE_OBJECT,
  TYPE_VALUE,
  defaultStageMap,
  defaultNextStages,
  EVENT_TYPE_MUTATE,
  EVENT_TYPE_ACTION,
  SET_RE,
  TRANS_TYPE_CHANGE,
  EVENT_TYPE_TRY,
  EVENT_TYPE_VALIDATE
} from './constants';
import {
  toMap, toObj, isMap, isObj, noop, maybeImmer, e, isFn, isThere, isArr, isStr, unsub, ucFirst, strip, mapFromKeys
} from './utils';
import { mirrorType, initQueue, makeDoProxy, makeDoObj, lazy } from './mirrorMisc';
import withTrans from './withTrans';
import withAction from './withAction';
import withChildren from './withChildren';
import withEvents from './withEvents';
import MirrorTrans from './MirrorTrans';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends ((withEvents(withTrans(BehaviorSubject)))) {
  constructor(value, config = ABSENT) {
    super(value);
    this.$configure(config);
    this.$_constructed = true;
  }

  /** *************** configuration/type ****************** */

  $configure(config = {}) {
    if (!this.$_constructed) {
      this.$_type = mirrorType(this, this.value);
    }
    if (!(isObj(config) || (isMap(config)))) {
      return this.$configure({});
    }
    const {
      name = NAME_UNNAMED,
      test = ABSENT,
      type = ABSENT,
      parent = ABSENT,
      children = ABSENT,
      actions = ABSENT,
    } = toObj(config);

    if (isThere(actions) && isObj(actions)) {
      Object.keys(actions)
        .forEach((actionName) => {
          this.$addAction(actionName, actions[actionName]);
        });
    }

    if (isThere(name)) {
      this.$name = name;
    }

    if (isThere(test)) {
      this.$_test = test;
    }

    if (isThere(type)) {
      this.$_type = type;
    }

    if (isThere(parent)) {
      this.$parent = parent;
    }

    if (isThere(children)) {
      toMap(children)
        .forEach((child, name) => {
          this.$addChild(name, child);
        });
    }
  }

  get $type() {
    return this.$_type;
  }

  get $isContainer() {
    return this.$type === TYPE_MAP || this.$type === TYPE_OBJECT;
  }

  get $isValue() {
    return this.$type === TYPE_VALUE;
  }

  $keys() {
    const childKeys = this.$_children ? Array.from(this.$children.keys()) : [];
    let valueKeys = [];
    if (this.$type === TYPE_MAP) {
      const valueKeys = Array.from(this.value.keys());
    }
    if (this.$type === TYPE_OBJECT) {
      valueKeys = Array.from(Object.keys(this.value));
    }
    return uniq([...valueKeys, ...childKeys])
      .sort();
  }

  /** *************** Subject handlers ****************** */
  get $currentValue() {
    return this.$_has_pending? this.$_last_pending.value : this._value;
  }

  /**
   *
   * @param nextValue
   * @return {Subscription};
   */
  next(nextValue) {
    if (!this.$_constructed) {
      // do not validate first value; accept it no matter what
      super.next(nextValue);
    }
    else {
      const event = this.$event(EVENT_TYPE_NEXT, nextValue);
      try {
        this.$event(EVENT_TYPE_VALIDATE, event);
      } catch (err) {
        console.log('validation error: ', err);
      }
      if (!this.$isValid()) {
        const errors = this.$errors();
        this.$event(EVENT_TYPE_REVERT, event);
        throw errors;
      }
      this.$event(EVENT_TYPE_COMMIT, event);
    }
  }

  /**
   * returns the value that is queued to replace the current value.
   * If there is no pending value, returns the actual current value.
   * @returns {*}
   */
  get $_pendingValue() {
    // let queuedValue = this.$_lastQueuedValue;
    // if (queuedValue !== ABSENT) {
    //   return queuedValue;
    // }
    return isThere(this.$_trialValue) ? this.$_trialValue : super.getValue(); // $_trialValue is being deprecated
  }

  /** *************** try/catch, validation ****************** */

  get $isTrying() {
    return isThere(this.$_trialValue);
  }

  /**
   *
   * @returns {undefined|function}
   */
  get $test() {
    return isFn(this.$_test) ? this.$_test : undefined;
  }

  $isValid(candidate = ABSENT) {
    if (!isThere(candidate)) {
      candidate = this.getValue();
    }
    return !this.$errors(candidate);
  }

  $errors(candidate = ABSENT) {
    if (!isThere(candidate)) {
      candidate = this.getValue();
    }
    let errors = false;
    if (isFn(this.$test)) {
      try {
        errors = this.$test(candidate);
      } catch (err) {
        errors = err;
      }
    }

    return errors;
  }

  /**
   * executes a function, silently stifling errors.
   * returns any thrown error as a result -- or the result of fn, if no error is thrown
   * note - $_do is NOT async - async output will return a promise which must be managed externally
   *
   * @param fn
   * @param args
   */
  $_do(fn, ...args) {
    let result = null;
    let error = null;
    if (isFn(fn)) {
      try {
        result = fn(this, this.value, ...args);
      } catch (err) {
        error = err;
      }
    }

    return {
      error,
      result
    };
  }

  /******* introspection *********** */

  $get(key, value = ABSENT) {
    if (this.$hasChild) {
      return this.$children.get(key).value;
    }
    if (this.$type === TYPE_MAP) {
      return this.value.get(key);
    }
    if (!isObj(this.value)) {
      return undefined;
    }
    return this.value[key];
  }

  $has(key) {
    return this.$hasChild(key) || this.$keys.includes(key);
  }

  $delete(name) {
    let event = this.$mutate((draft) => {
      return strip(name, draft);
    });

    const target = this;
    if (event && !event.isStopped) {
      event.subscribe({
        error() {

        },
        complete() {
          target.$removeChild(name);
        }
      });
    }
    else {
      this.$removeChild(name);
    }
  }

}

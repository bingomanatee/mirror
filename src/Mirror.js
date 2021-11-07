/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, combineLatest, combineLatestWith, distinct, from, of, Subject } from 'rxjs';
import produce, { enableMapSet, isDraft } from 'immer';
import isEqual from 'lodash/isEqual';
import uniq from 'lodash/uniq';

enableMapSet();
import {
  ABSENT,
  EVENT_TYPE_CHILD_ADDED, EVENT_TYPE_COMMIT,
  EVENT_TYPE_NEXT, EVENT_TYPE_REVERT,
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
  defaultStageMap, defaultNextStages, EVENT_TYPE_MUTATE, EVENT_TYPE_ACTION, SET_RE, TRANS_TYPE_CHANGE
} from './constants';
import {
  toMap, toObj, isMap, isObj, noop, maybeImmer, e, isFn, isThere, isArr, isStr, unsub, ucFirst, strip, mapFromKeys
} from './utils';
// import { addChild, hasChild, mirrorHas, removeChild, setParent, updateChildren } from './childParentUtils';
import { mirrorType, initQueue, makeDoProxy, makeDoObj, lazy } from './mirrorMisc';
import withTrans from './withTrans';
import withAction from './withAction';
import withChildren from './withChildren';
import withEvents from './withEvents';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends withAction(withChildren(withEvents(withTrans(BehaviorSubject)))) {
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
    return isThere(this.$_trialValue) ? this.$_trialValue : this._value;
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
    } else {
      const event = this.$event(EVENT_TYPE_NEXT, nextValue);
      if (event.hasError) {

      }
      return event;
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

  getValue() {
    let value = this.$_pendingValue;
    if (this.$isValue) {
      return value;
    }
    return this.$_valueWithChildren(value);
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

    return errors || (this.$isContainer ? this.$childErrors : false);
  }

  /** *************** event queue ****************** */

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

    return error ? error : result;
  }

  /**
   * either finalized a new next value, or locks in the trial value.
   * Updates the parent._next value;
   * note -- passing a new value into $commit IGNORES errors!
   * @param value
   */
  $commit(value = ABSENT) {
    if (this.isStopped) {
      throw e('cannot commit value to committed Mirror', {
        value,
        target: this
      });
    }
    if (isThere(value)) {
      super.next(value);
      this.$event(EVENT_TYPE_COMMIT, value);
    } else {
      if (this.$isContainer) {
        this.$children.forEach((child) => child.$flush());
      }
      if (this.$isTrying) {
        const nextValue = this.getValue();
        super.next(nextValue);
        this.$event(EVENT_TYPE_COMMIT, nextValue);
        this.$_clearTrialValue();
      }
    }
    return this;
  }

  /**
   * reverts or commits the $_trialValue.
   * @returns {Mirror}
   */
  $flush() {
    if (this.$isContainer) {
      this.$children.forEach((child) => child.$flush());
    }
    if (this.$isTrying) {
      if (!this.$errors()) {
        this.$commit();
      } else {
        this.$revert();
      }
    }
    return this;
  }

  /**
   * removes trial value; happens on commit and revert.
   */
  $_clearTrialValue() {
    this.$_trialValue = undefined;
  }

  $revert() {
    this.$event(EVENT_TYPE_REVERT, this.$_trialValue);
    this.$_clearTrialValue();
  }

  /******* containers *********** */

  $valueGet(key, value = ABSENT) {
    if (!this.$isContainer) {
      return false;
    }
    if (!isThere(value)) {
      value = this.getValue();
    }
    if (this.$type === TYPE_MAP) {
      return value.get(key);
    }
    return value[key];
  }

  $has(key) {
    if (!this.$isContainer) {
      return false;
    }
    if (this.$hasChild(key)) {
      return true;
    }

    if (this.$type === TYPE_MAP) {
      return this.value.has(key);
    }
    if (this.$type === TYPE_OBJECT) {
      return key in this.value;
    }
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
    } else {
      this.$removeChild(name);
    }
  }

}

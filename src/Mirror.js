/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, combineLatest, combineLatestWith, from, of, Subject } from 'rxjs';
import produce, { enableMapSet, isDraft } from 'immer';
import isEqual from 'lodash/isEqual';

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
  defaultStageMap, defaultNextStages
} from './constants';
import {
  toMap, toObj, isMap, isObj, noop, maybeImmer, e, isFn, isThere, isArr, isStr, unsub
} from './utils';
// import { addChild, hasChild, mirrorHas, removeChild, setParent, updateChildren } from './childParentUtils';
import { mirrorType, initQueue } from './mirrorMisc';
import { catchError, distinctUntilKeyChanged, filter, map, switchMap, finalize, tap } from 'rxjs/operators';
import MirrorEvent from './MirrorEvent';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, config = ABSENT) {
    super(value);
    this.$configure(config);
    this.$_listen();
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
    } = toObj(config);

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

  /** *************** Subject handlers ****************** */

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
      return this.$event(EVENT_TYPE_NEXT, nextValue);
    }
  }

  getValue() {
    let value = isThere(this.$_trialValue) ? this.$_trialValue : super.getValue();

    if (this.$isValue) {
      return value;
    }
    return this.$_valueWithChildren(value);
  }

  $_valueWithChildren(value = ABSENT) {
    if (!isThere(value)) {
      value = value = isThere(this.$_trialValue) ? this.$_trialValue : super.getValue();
    }

    const target = this;
    return produce(value, (draft) => {
      target.$children.forEach((childMirror, name) => {
        switch (target.$type) {
          case TYPE_MAP:
            draft.set(name, childMirror.value);
            break;

          case TYPE_OBJECT:
            draft[name] = childMirror.value;
            break;
        }
      });
    });
  }

  /** *************** try/catch, validation ****************** */

  /**
   * ordinarily when you next(), the value is submitted synchronously.
   * $try(v).$then(fn).$catch(fn).$finally(fn);
   * allows you to react dynamically to errors if isThere before bad data is rejected.
   *
   * ---- implicit actions
   * ---- $try(v) submits the value to trial value; the value of the Mirror is then locked in to the new value,
   *              BUT NO SUBSCRIPTIONS are notified.
   * ---- $then() commits the trial value - if isThere are no errors -- which also clears the trial value, THEN calls the hook
   * ---- $catch() passes errors to the hook, calls the hook, THEN, clears the trial value.
   * ---- $finally() commits the trial value or clears it if isThere are errors, THEN calls the hook.
   *
   * committing WILL notify subscribers that changes have happened.
   *
   * ----------- alternate all in one $try ---------
   * $try(value, thenFn, catchFn, finalFn)
   * calls all or part of the try/then/catch/finally sequence, if one or more functions are passed in after the first one.
   *
   * ----------- the "TAKE TWO" rule -------------
   *
   * note; unlike promise try/catch, $try chains are synchronous. they just let you intercept side effects of change.
   * its not a good idea to call $try(candidate) without either $catch(), $flush or $finally] in the same line.
   * A "hanging $try()" leaves the trial value in place as the mirror's value
   * even if the value is bad, and just as bad doesn't notify subscribers.
   *
   * Also, the try handlers must be called IN THAT ORDER.
   *
   * lastly, $flush() , like
   */

  $_try(value) {
    if (this.isStopped) {
      throw e('cannot try value on stopped Mirror', {
        value,
        target: this
      });
    }
    this.$_trialValue = value;

    if (this.$isContainer) {
      this.$children.forEach((child, name) => {
        if (this.$valueHas(name, value)) {
          child.$_try(this.$valueGet(name, value));
        }
      });
    }
  }

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

  $_listen() {
    this.$on(
      EVENT_TYPE_NEXT,
      (value, p, t) => {t.$_try(value)},
      STAGE_INIT
    );
    this.$on(
      EVENT_TYPE_NEXT,
      (value, p, t) => {
        const errs = t.$errors();
        if (errs) {
          t.$revert();
          p.error(errs);
        }
      },
      STAGE_VALIDATE
    ); // local validation

    this.$on(
      EVENT_TYPE_NEXT,
      (value, p, t) => t.$commit(),
      STAGE_FINAL
    );
  }

  /**
   *
   * @returns {Observable}
   */
  get $_eventQueue() {
    if (!this.$__eventQueue) {
      const target = this;
      this.$__eventQueue = new Subject()
        .pipe(
          switchMap((value) => from([value]))
        );
    }
    return this.$__eventQueue;
  }

  get $_stages() {
    if (!this.$__stages) {
      return defaultStageMap;
    }
    return this.$__stages;
  }

  /**
   *
   * @param type
   * @param value
   * @returns {(string)[]}
   */
  $_stagesFor(type, value) {
    if (this.$_stages.has(type)) {
      return this.$_stages.get(type);
    } else {
      return defaultNextStages;
    }
  }

  $setStages(type, list) {
    if (!this.$__stages) {
      this.$__stages = new Map(defaultStageMap);
    }

    if (!isArr(list)) throw e('bad input to $setStages', {type, list});

    this.$_stages.set(type, list);
  }

  $event(type, value = ABSENT, onSuccess, onFail, onComplete) {
    let stages = this.$_stagesFor(type, value);
    const target = this;
    const event = new MirrorEvent(value, type, this);
    event.subscribe({
      complete() {
        if (isFn(onComplete)) {
          target.$_do(onComplete)
        }
      },
      error(err) {
        target.$_eventQueue.next({
          value: err,
          $type: type,
          $stage: STAGE_ERROR
        });
        if (isFn(onFail)) {
          target.$_do(onFail, err);
        }
        if (isFn(onComplete)) {
          target.$_do(onComplete, err);
        }
      }
    });
    for (let i = 0; i < stages.length; ++i) {
      event.$stage = stages[i];
      try {
        this.$_eventQueue.next(event);
      } catch (err) {
        console.log('error on next', err);
      }
      if (event.isStopped) {
        break;
      }
      else {
        value = event.value;
      }
    }
    if (!event.isStopped) {
      event.complete();
    }
  }

  $once($type, handler, ...rest) {
    let sub;
    const tap = (...args) => {
      try {
        let out = handler(...args);
        unsub(sub);
        return out;
      } catch (err) {
        unsub(sub);
        throw err;
      }
    };
    sub = this.$on($type, tap, ...rest);
    return sub;
  }

  $on($type, handler, $stage = STAGE_PERFORM, $test = ABSENT) {
    const target = this;
    if (!isFn(handler)) {
      throw e('second argument of $on must be function', {
        target: this,
        type: $type,
        handler
      });
    }

    return this.$_eventQueue
      .pipe(
        filter((phase) => (
          (($type === '*') || (phase.$type === $type))
          && (($stage === '*') || (phase.$stage === $stage))
          && ((!isFn($test)) || $test(phase.value, phase, target)))
        )
      )
      .subscribe({
        error(err) {
          console.log('$on error:', err);
        },
        next(phase) {
          const {
            $type: type,
            $stage: stage,
            value
          } = phase;
          try {
            handler(value, phase, target);
          } catch (err) {
            if (!phase.isStopped) {
              phase.error(err);
            }
          }
        }
      });
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

    return error ? error : result;
  }

  $finally(fn) {
    this.$flush();
    this.$_do(fn);
    return this;
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
    }
    else {
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
      }
      else {
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

  $valueHas(key, value = ABSENT) {
    if (!this.$isContainer) {
      return false;
    }
    if (!isThere(value)) {
      value = this.getValue();
    }
    if (this.$type === TYPE_MAP) {
      return value.has(key);
    }
    return key in value;
  }

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

  /**
   *
   * @param key
   * @param subject
   * @returns {any}
   */
  $_strip(key, subject) {
    let stripped = null;
    if (this.$type === TYPE_MAP) {
      stripped = new Map(subject);
      stripped.delete(key);
    }
    if (this.$type === TYPE_OBJECT) {
      stripped = { ...subject };
      delete stripped[key];
    }
    return stripped;
  }

  /**
   * returns false if any children are invalid.
   * @returns {boolean}
   */
  get $childErrors() {
    if (!this.$isContainer) {
      return false;
    }
    if (this.$parent) {
      return this.$parent.$errors;
    }
    return false;
  }

  get $children() {
    if (!this.$_children) {
      this.$_children = new Map();
    }
    return this.$_children;
  }

  $addChild(name, value, type = TYPE_VALUE) {
    if (this.isStopped) {
      throw e('attempt to redefine stopped mirror', {
        target: this,
        name,
        value
      });
    }
    let childMirror;
    if (value instanceof Mirror) {
      value.$configure({
        name,
        parent: this
      });
      childMirror = value;
    }
    else {
      childMirror = new Mirror(value, {
        name,
        type,
        parent: this
      });
    }
    this.$children.set(name, childMirror);
    const target = this;
    this.$_childSubs.set(name, childMirror.subscribe({
      next(value) {
        if (!target.$isTrying) {
          target.next(target.getValue());
        }
      },
      error(err) {
        console.log('--- child error thrown', err,
          'for child', name, 'of', target);
      }
    }));
    if (this.$_constructed) {
      this.$event(EVENT_TYPE_CHILD_ADDED, {
        name,
        childMirror
      });
    }
    this.next(this.getValue());
  }

  $hasChild(name) {
    if (!this.$_children) {
      return false;
    }
    return this.$children.has(name);
  }

  $delete(name, persistChild = false) {
    let prevValue = this.getValue();
    let valueAfterDelete = prevValue;
    let child = null;
    let removed = null;
    let childSub = null;
    let onCommit;
    const target = this;

    if (this.$isValue) {
      if (isMap(valueAfterDelete)) {
        valueAfterDelete = new Map(prevValue);
        removed = valueAfterDelete.get(name);
        valueAfterDelete.delete(name);
      }
      if (isObj(valueAfterDelete)) {
        valueAfterDelete = { ...prevValue };
        removed = valueAfterDelete[name];
        valueAfterDelete = produce(valueAfterDelete, (draft) => {
          delete draft[name];
        });
      }
    }

    if (this.$isContainer) {
      if (this.$hasChild(name)) {
        child = this.$children.get(name);
        removed = child.value;
      }

      if (this.$_childSubs.has(name)) {
        childSub = this.$_childSubs.get(name);
      }

      onCommit = () => {
        if (!child && persistChild) {
          child.complete();
          target.$children.delete(name);
        }
        if (childSub) {
          childSub.unsubscribe();
          target.$_childSubs.delete(name);
        }
      };

      valueAfterDelete = this.$_strip(name, valueAfterDelete);
    }
    if (this.$isTrying) {
      this.$_trialValue = valueAfterDelete;
      if (onCommit) {
        let subRevert;
        let subCommit;
        subRevert = this.$on(EVENT_TYPE_REVERT, () => {
          unsub(subCommit);
          unsub(subRevert);
        });
        subCommit = this.$on(EVENT_TYPE_COMMIT, () => {
          if (isFn(onCommit)) {
            onCommit();
          }
          unsub(subCommit);
          unsub(subRevert);
        });
      }
    }
    else {
      if (onCommit) {
        onCommit();
      }
      this.next(valueAfterDelete);
    }
    return {
      target: this,
      value: this.getValue(),
      valueAfterDelete,
      prevValue,
      removed,
      child
    };
  }

  get $_childSubs() {
    if (!this.$__childSubs) {
      this.$__childSubs = new Map();
    }
    return this.$__childSubs;
  }
}

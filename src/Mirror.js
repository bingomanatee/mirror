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
import { catchError, distinctUntilKeyChanged, filter, map, switchMap, finalize, tap } from 'rxjs/operators';
import MirrorEvent from './MirrorEvent';
import MirrorTrans from './MirrorTrans';
import withTrans from './withTrans';
import withAction from './withAction';
import withChildren from './withChildren';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends withAction(withChildren((withTrans(BehaviorSubject)))) {
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
    const uniqValKeys = valueKeys.filter(key => !childKeys.includes(key));
    return [...uniqValKeys, ...childKeys].filter(k => isStr(k, true))
      .sort();
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
    } else {
      return this.$event(EVENT_TYPE_NEXT, nextValue);
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

  $_listen() {
    this.$on(
      EVENT_TYPE_NEXT,
      (value, p, t) => {
        t.$_trialValue = value;
      },
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

    this.$on(
      EVENT_TYPE_MUTATE,
      ({
        fn,
        args
      }, p, t) => {
        try {
          let nextValue = produce(t.value, (draft) => {
            return fn(draft, t, ...args);
          });
          p.next({
            fn,
            args,
            nextValue
          });
        } catch (err) {
          p.error(err);
        }
      },
      STAGE_PERFORM
    );

    this.$on(
      EVENT_TYPE_MUTATE,
      ({
        fn,
        args,
        nextValue
      }, p, t) => {
        const nextEvent = t.next(nextValue);
        if (nextEvent && nextEvent.thrownError) {
          p.error(nextEvent.thrownError);
        } else {
          p.next({
            fn,
            args,
            nextValue,
            next: t.value
          });
        }
      },
      STAGE_FINAL
    );

    this.$on(EVENT_TYPE_ACTION, ({
      name,
      args
    }, p, t) => {
      if (!t.$_actions.has(name)) {
        p.error(e('no action named ' + name));
      } else {
        try {
          t.$_actions.get(name)(t, ...args);
        } catch (err) {
          p.error(err);
        }
      }
    });
  }

  /**
   *
   * @returns {Observable}
   */
  get $_eventQueue() {
    return lazy(this, '$__eventQueue', () => new Subject()
      .pipe(switchMap((value) => from([value]))));
  }

  /**
   *
   * @returns {Map}
   */
  get $_stages() {
    return lazy(this, '$__stages', () => new Map(defaultStageMap));
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
    if (!isArr(list)) {
      throw e('bad input to $setStages', {
        type,
        list
      });
    }

    this.$_stages.set(type, list);
  }

  $event(type, value = ABSENT, onSuccess, onFail, onComplete) {
    let stages = this.$_stagesFor(type, value);
    const target = this;
    const event = new MirrorEvent(value, type, this);
    event.subscribe({
      complete() {
        if (isFn(onComplete)) {
          target.$_do(onComplete);
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
      } else {
        value = event.value;
      }
    }
    if (!event.isStopped) {
      event.complete();
    }
    return event;
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

  $hasChild(name) {
    // note - respecting the lazy nature of $children
    return this.$_children && this.$children.has(name);
  }

  $removeChild(name) {
    if (this.$hasChild(name)) {
      const child = this.$children.get(name);
      this.$children.delete(name);
      if (!child.isStopped) {
        child.complete();
      }
      if (this.$_childSubs.has(name)) {
        try {
          this.$_childSubs.get(name)
            .unsubscribe();
        } catch (err) {
          console.warn('childSub error unsubscribing:', err);
        }
      }
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

  /******* actions *********** */

  $mutate(fn, ...args) {
    if (!isFn(fn)) {
      throw e('$mutate passed non-function', { fn });
    }

    return this.$event(EVENT_TYPE_MUTATE, {
      fn,
      args
    });
  }

  $set(name, value) {
    if (!this.$isContainer) {
      throw e('cannot set to non-container', {
        name,
        value,
        target: this
      });
    }

    if (this.$hasChild(name)) {
      return this.$children.get(name)
        .set(value);
    }
    if (this.$type === TYPE_MAP) {
      return this.$mutate((draft) => {
        draft.set(name, value);
      });
    }
    if (this.$type === TYPE_OBJECT) {
      return this.$mutate((draft) => {
        draft[name] = value;
      });
    }
  }

  get $_actions() {
    return lazy(this, '$__actions', () => new Map());
  }
}

/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, combineLatest, combineLatestWith, from, of, Subject } from 'rxjs';
import produce, { enableMapSet } from 'immer';

enableMapSet();
import {
  ABSENT,
  CHILDREN,
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
} from './constants';
import {
  toMap, toObj, isMap, isObj, noop, maybeImmer, e, isFn, there, isArr, isStr
} from './utils';
// import { addChild, hasChild, mirrorHas, removeChild, setParent, updateChildren } from './childParentUtils';
import { mirrorType, initQueue } from './mirrorMisc';
import { catchError, distinctUntilKeyChanged, filter, map, switchMap, finalize, tap } from 'rxjs/operators';
import Event from './Event';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, config = ABSENT) {
    super(value);
    this.$configure(config);
    this.$_constructed = true;
  }

  $configure(config = {}) {
    this.$type = mirrorType(this, this.value);
    if (!(isObj(config) || (isMap(config)))) {
      return this.$configure({});
    }
    const {
      name = NAME_UNNAMED,
      test = ABSENT,
      type = ABSENT
    } = toObj(config);
    if (there(name)) {
      this.$name = name;
    }
    if (there(test)) {
      this.$_test = test;
    }
    if (there(type)) {
      this.$type = type;
    }
  }

  /**
   *
   * @returns {undefined|function}
   */
  get $test() {
    return isFn(this.$_test) ? this.$_test : undefined;
  }

  /**
   * a subject that takes in next values
   * and only returns if they pass $test.
   *
   * @returns {Subject}
   */
  get $_queue() {
    if (!this.$__queue) {
      initQueue(this);
    }
    return this.$__queue;
  };

  next(nextValue) {
    if (!this.$_constructed) {
      // do not validate first value; accept it no matter what
      super.next(nextValue);
    }
    else {
      this.$_queue.next(nextValue);
    }
  }

  /** *************** try/catch ****************** */

  /**
   * ordinarily when you next(), the value is submitted synchronously.
   * $try(v).$then(fn).$catch(fn).$finally(fn);
   * allows you to react dynamically to errors if there before bad data is rejected.
   *
   * ---- implicit actions
   * ---- $try(v) submits the value to trial value; the value of the Mirror is then locked in to the new value,
   *              BUT NO SUBSCRIPTIONS are notified.
   * ---- $then() commits the trial value - if there are no errors -- which also clears the trial value, THEN calls the hook
   * ---- $catch() passes errors to the hook, calls the hook, THEN, clears the trial value.
   * ---- $finally() commits the trial value or clears it if there are errors, THEN calls the hook.
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
   * its not a good idea to call $try(candidate) without two out of three
   * of [$then(), $catch(), $finally] in the same line.
   * A "hanging $try()" leaves the trial value in place as the mirror's value
   * even if the value is bad, and just as bad doesn't notify subscribers.
   *
   * Also, the try handlers must be called IN THAT ORDER.
   *
   * lastly, $flush() , like
   */

  /**
   * stages changes for latter commit.
   *
   *
   * @param value
   * @param thenFn {function?}
   * @param catchFn {function?}
   * @param finalFn {function?}
   * @returns {Mirror}
   */
  $try(value, thenFn, catchFn, finalFn) {
    this.$_thenCalled = false;
    this.$_trialValue = value;
    if (isFn(thenFn)) {
      this.$then(thenFn);
    }
    if (isFn(catchFn)) {
      this.$catch(catchFn);
    }
    if (isFn(finalFn)) {
      this.$finally(finalFn);
    }
    return this;
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
          switchMap((value) => from([value])
            .pipe(catchError(err => from([])))),
        );
    }
    return this.$__eventQueue;
  }

  $event(type, value = ABSENT) {
    let stages = [STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL];
    const target = this;
    for (let i = 0; i < stages.length; ++i) {
      const event = new Event(value, type, this);
      event.$stage = stages[i];
      event.subscribe({
        error(err) {
          target.$_eventQueue.next({
            value: err,
            $type: type,
            $stage: STAGE_ERROR
          });
        }
      });
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

    return this.$_eventQueue.subscribe({
      error(err) {
        console.log('$on error:', err);
      },
      next(phase) {
        const {
          $type: type,
          $stage: stage,
          value
        } = phase;
        if ($type && ($type !== '*') && ($type !== type)) {
          return;
        }
        if ($stage !== stage) {
          return;
        }
        if (isFn($test)) {
          try {
            if (!$test(value, phase)) {
              return;
            }
          } catch (err) {
            return;
          }
        }

        try {
          handler(value, phase);
        } catch (err) {
          if (!phase.isStopped) {
            phase.complete();
          }
        }
      }
    });
  }

  $do(fn, ...args) {
    const event = new Event((value) => fn(value, this, ...args), 'fn');
    event.$perform()
      .subscribe((phase) => {
        if (!this.isStopped) {
          this.$_eventQueue.next(phase);
        }
      });
  }

  $then(fn) {
    if (!this.$errors()) {
      this.$commit(); // clears trial value
      this.$_do(fn);
    }
    return this;
  }

  $catch(fn, noClear = false) {
    const errs = this.$errors();
    if (errs) {
      fn(errs, this.value, this);
      if (!noClear) {
        this.$clearTrial();
      }
    }
    return this;
  }

  $_do(fn, ...args) {
    if (isFn(fn)) {
      try {
        if (args.length) {
          fn(...args);
        }
        else {
          fn(this, this.value);
        }
      } catch (err) {
        console.warn(err);
      }
    }
  }

  $finally(fn) {
    this.$flush();
    this.$_do(fn);
    return this;
  }

  $errors(candidate = ABSENT) {
    if (!there(candidate)) {
      candidate = this.getValue();
    }
    if (!isFn(this.$test)) {
      return false;
    }
    try {
      return this.$test(candidate);
    } catch (err) {
      return err;
    }
  }

  get $isTrying() {
    return there(this.$_trialValue);
  }

  $isValid(candidate = ABSENT) {
    if (!there(candidate)) {
      candidate = this.getValue();
    }
    return !this.$errors(candidate);
  }

  getValue() {
    if (there(this.$_trialValue)) {
      return this.$_trialValue;
    }
    return super.getValue();
  }

  /**
   * either injects a new next value, or locks in the trial value.
   * note -- IGNORES errors!
   * @param value
   */
  $commit(value = ABSENT) {
    if (there(value)) {
      super.next(value);
    }
    else if (this.$isTrying) {
      super.next(this.$_trialValue);
    }
    this.$clearTrial();
    return this;
  }

  $flush() {
    if (this.$isTrying) {
      if (!this.$errors()) {
        this.$commit();
      }
      this.$clearTrial();
    }
    return this;
  }

  $clearTrial() {
    this.$_trialValue = undefined;
  }
}

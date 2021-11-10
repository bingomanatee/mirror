import produce from 'immer';
import { from, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import {
  ABSENT,
  defaultNextStages,
  defaultStageMap,
  EVENT_TYPE_ACTION,
  EVENT_TYPE_MUTATE,
  EVENT_TYPE_NEXT, STAGE_ERROR,
  STAGE_FINAL,
  STAGE_INIT,
  STAGE_PERFORM,
  STAGE_VALIDATE,
} from './constants';
import {
  e, isArr, isFn, unsub,
} from './utils';
import { lazy } from './mirrorMisc';
import MirrorEvent from './MirrorEvent';

export default (BaseClass) => class WithChildren extends BaseClass {
  constructor(...args) {
    super(...args);
    this.$on(
      EVENT_TYPE_NEXT,
      (value, p, t) => {
        t.$_trialValue = value;
        if (t.$isContainer) {
          t.$_sendToChildren(value);
        }
      },
      STAGE_INIT,
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
      STAGE_VALIDATE,
    ); // local validation

    // this.$on(
    //   EVENT_TYPE_NEXT,
    //   (value, p, t) => t.$commit(),
    //   STAGE_FINAL,
    // );
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
    }

    return defaultNextStages;
  }

  $setStages(type, list) {
    if (!isArr(list)) {
      throw e('bad input to $setStages', {
        type,
        list,
      });
    }

    this.$_stages.set(type, list);
  }

  $event(type, value = ABSENT, onSuccess, onFail, onComplete) {
    const stages = this.$_stagesFor(type, value);
    const target = this;
    const event = new MirrorEvent(value, type, this);
    event.subscribe({
      complete() {
        if (isFn(onComplete)) {
          target.$_do(onComplete);
        }
      },
      error(err) {
        event.$stage = STAGE_ERROR;
        target.$_eventQueue.next(event);
        if (isFn(onFail)) {
          target.$_do(onFail, err);
        }
      },
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
    }
    if (!event.isStopped) {
      event.complete();
    }
    return event;
  }

  $once($type, handler, ...rest) {
    const sub = this.$on($type, (...args) => {
      try {
        const out = handler(...args);
        sub.unsubscribe();
        return out;
      } catch (err) {
        sub.unsubscribe();
        throw err;
      }
    }, ...rest);
    return sub;
  }

  $on($type, handler, $stage = STAGE_PERFORM, $test = ABSENT) {
    const target = this;
    if (!isFn(handler)) {
      throw e('second argument of $on must be function', {
        target: this,
        type: $type,
        handler,
      });
    }

    return this.$_eventQueue
      .pipe(
        filter((phase) => (
          (($type === '*') || (phase.$type === $type))
          && (($stage === '*') || (phase.$stage === $stage))
          && ((!isFn($test)) || $test(phase.value, phase, target)))),
      )
      .subscribe({
        error(err) {
          console.log('$on error:', err);
        },
        next(phase) {
          try {
            handler(phase.value, phase, target);
          } catch (err) {
            if (!phase.isStopped) {
              phase.error(err);
            }
          }
        },
      });
  }
};

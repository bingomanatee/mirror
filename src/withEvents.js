import produce from 'immer';
import { from, Subject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import {
  ABSENT,
  defaultNextStages,
  defaultStageMap,
  EVENT_TYPE_ACTION, EVENT_TYPE_COMMIT,
  EVENT_TYPE_MUTATE,
  EVENT_TYPE_NEXT, EVENT_TYPE_REVERT, EVENT_TYPE_VALIDATE, STAGE_ERROR,
  STAGE_FINAL,
  STAGE_INIT,
  STAGE_PERFORM,
  STAGE_VALIDATE,
} from './constants';
import {
  e, isFn,
} from './utils';
import { lazy } from './mirrorMisc';
import MirrorTrans from './MirrorTrans';

export default (BaseClass) => class WithEvents extends BaseClass {
  constructor(...args) {
    super(...args);
    this.$on(EVENT_TYPE_NEXT, (value, trans) => {
      this.$_upsertTrans(trans);
    });
    this.$on(EVENT_TYPE_VALIDATE, (trans, event, target) => {
      if (isFn(target.$test)) {
        let error = null;
        try {
          error = target.$test(this.getValue());
        } catch (err) {
          error = err;
        }
        if (error) {
          target.$_upsertTrans(trans, (draft) => {
            draft.error = error;
          });
        }
      }
    });

    this.$on(EVENT_TYPE_REVERT, (trans, event, target) => {
      target.$_purgeChangesAfter(trans);
    });

    this.$on(EVENT_TYPE_COMMIT, (trans, event, target) => {
      target.$_commitTrans(trans);
    });
  }

  /**
   *
   * @returns {Observable}
   */
  get $_eventQueue() {
    return lazy(this, '$__eventQueue', () => new Subject());
  }

  $event(type, value = ABSENT) {
    const event = MirrorTrans.make({
      type,
      value,
    });
    this.$_eventQueue.next(event);
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

  $on(type, handler, $test = ABSENT) {
    const target = this;
    if (!isFn(handler)) {
      throw e('second argument of $on must be function', {
        target: this,
        type,
        handler,
      });
    }

    return this.$_eventQueue
      .pipe(
        filter((phase) => (
          ((type === '*') || (phase.type === type))
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

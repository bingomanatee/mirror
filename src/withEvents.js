import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import uniq from 'lodash/uniq';

import {
  ABSENT, EVENT_TYPE_COMMIT,
  EVENT_TYPE_NEXT, EVENT_TYPE_REVERT, EVENT_TYPE_VALIDATE,
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
        let errors = [];
        try {
          errors = target.$errors();
        } catch (err) {
          errors = [err];
        }
        target.$_addErrorsToTrans(trans, errors);
      }
    });

    this.$on(EVENT_TYPE_REVERT, (id, event, target) => {
      target.$_purgeChangesAfter(id);
    });

    this.$on(EVENT_TYPE_COMMIT, (id, event, target) => {
      target.$_commitTrans(id);
    });
  }

  /**
   *
   * @returns {Observable}
   */
  get $_eventQueue() {
    return lazy(this, '$__eventQueue', () => new Subject());
  }

  $event(type, value = ABSENT, config = {}) {
    const event = MirrorTrans.make({
      type,
      value,
      ...config,
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

  $on(type, handler, $test = ABSENT, onErr = ABSENT) {
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
          if (isFn(onErr)) {
            onErr(err);
          } else {
            console.warn('$on error:', err, '; handler:', handler);
          }
        },
        next(phase) {
          try {
            handler(phase.value, phase, target);
          } catch (err) {
            if (isFn(onErr)) {
              onErr(err);
            }
          }
        },
      });
  }
};

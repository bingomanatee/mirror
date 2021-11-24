import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import { EVENT_TYPE_NEXT } from './constants';

export default {
  get $events() {
    return lazy(this, '$_events', () => new Subject());
  },

  /**
   *
   * @param type {scalar}
   * @param value {any}
   */
  $send(type, value) {
    const e = new MirrorEvent(value, type, this);
    this.$events.next(e);
    if (!e.isStopped) e.complete();
  },

  $on(type, handler) {
    return this.$events.pipe(filter((e) => e.$type === type)).subscribe({
      next(e) {
        if (e.isStopped) return;
        try {
          handler(e);
        } catch (err) {
          if (!e.isStopped) {
            e.error(err);
          }
        }
      },
    });
  },

  $_initEvents() {
    this.$on(EVENT_TYPE_NEXT, (event) => {
      event.subscribe({
        complete() {
          event.$target.$next(event.value);
        },
      });
    });
  },
};

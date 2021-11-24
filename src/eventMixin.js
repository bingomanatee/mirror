import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import { EVENT_TYPE_NEXT } from './constants';
import { isArr, sortBy } from './utils';

export default (BaseClass) => class WithEvents extends BaseClass {
  get $events() {
    return lazy(this, '$_events', (target) => {
      const sub = new Subject();
      sub.subscribe({
        next(e) {
          target.$_pushActive(e);
        },
        error(er) {
          //
        },
      });
      return sub;
    });
  }

  get $_active() {
    return lazy(this, '$__active', () => []);
  }

  set $_active(list) {
    if (isArr(list)) {
      this.$__active = list;
      if (this.$watchActive) {
        this.$watchActive(list);
      }
    }
  }

  /**
   * removes an event from the Active array,
   * and commits it
   * @param evt {MirrorEvent}
   */
  $_removeFromActive(evt, removeAfter = false) {
    const otherActive = this.$_active.filter((other) => !other.matches(evt) || (removeAfter && other.$isAfter(evt)));
    // if there are other non-change, non-complete actions in the queue
    // do NOT automatically dequeue a completed change.

    this.$_active = otherActive;
  }

  /**
   * register an in-process action into the queue;
   * @param evt {MirrorEvent}
   * @returns {Subscription | void | Unsubscribable | Promise<PushSubscription>}
   */
  $_pushActive(evt) {
    if (!evt || evt.isStopped) {
      return;
    }

    this.$_active = [...this.$_active, evt];
    const target = this;
    evt.$resolvers = evt.subscribe({
      complete() {
        if (evt.$type !== EVENT_TYPE_NEXT) {
          target.$_removeFromActive(evt);
        }
        target.$commit();
      },
      error(er) {
        target.$reset(evt, er);
      },
    });
    return evt.$resolvers;
  }

  /**
   * record completed values into the mirrors' value
   * and empty $_active of all pending
   */
  $commit() {
    if (!this.$_active.length) return;

    // do not flush until all actions have been completed;
    if (this.$_active.some((ev) => !ev.isStopped)) {
      return;
    }

    // if there are no errors, advance the last change
    if (!this.$_active.some((ev) => ev.hasError)) {
      const latest = this.$lastChange;

      if (latest) {
        this.$next(latest.value);
      }
    }

    this.$_active = [];
  }

  /**
   * on an event failure, flush the active events of the event
   * and any event after it. Also, force any open events to fail which
   * will ultimately clear all events and triggers the side effects of that
   * all the way up the chain unless one of the events is capable of
   * stopping the chain reaction
   * @param evt {MirrorEvent}
   * @param err {Error}
   */
  $reset(evt, err) {
    const openEvents = this.$_active.filter((other) => !other.matches(evt) && !other.isStopped);
    if (openEvents.length) {
      openEvents.pop().error(err);
    }
    if (this.$_active.includes(evt)) {
      this.$_removeFromActive(evt, true);
    }
  }

  get $lastChange() {
    if (!this.$__active) {
      return null;
    }
    return this.$_active.reduce((last, next) => {
      if ((next.$type === EVENT_TYPE_NEXT) && (!next.hasError)) {
        return next;
      }
      return last;
    }, null);
  }

  /**
   *
   * @param type {scalar} the event type
   * @param value {any} the data / config of the event
   * @param stayOpen {boolean} a flag to prevent $send from ensuring the event is completed.
   *                           if true, the caller MUST complete the event eventually.
   * @returns {MirrorEvent}
   */
  $send(type, value, stayOpen = false) {
    const evt = new MirrorEvent(value, type, this);
    this.$events.next(evt);
    if (!evt.isStopped && (!stayOpen)) {
      evt.complete();
    }
    return evt;
  }

  $on(type, handler) {
    return this.$events.pipe(filter((e) => e.$type === type))
      .subscribe({
        next(e) {
          if (e.isStopped) {
            return;
          }
          try {
            handler(e);
          } catch (err) {
            if (!e.isStopped) {
              e.error(err);
            }
          }
        },
      });
  }
};

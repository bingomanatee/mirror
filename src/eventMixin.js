import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import { EVENT_TYPE_NEXT } from './constants';
import { isArr, sortBy } from './utils';

export default (BaseClass) => class WithEvents extends BaseClass {
  constructor(...args) {
    super(...args);

    this.$on(EVENT_TYPE_NEXT, (value, evt, target) => {
      target.$_pushActive(evt);
      evt.subscribe({
        complete() {
          target.$commit();
        },
        error() {
          target.$reset(evt);
        },
      });
    });
  }

  get $events() {
    return lazy(this, '$_events', () => {
      const sub = new Subject();
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
   *
   * @param evt {MirrorEvent}
   * @returns {MirrorEvent}
   */
  $_pushActive(evt) {
    if (!evt || evt.isStopped) {
      return evt;
    }

    this.$_active = [...this.$_active, evt];
    return evt;
  }

  /**
   * returns true only if $_active has events AND they are all stopped
   * @returns {*|boolean}
   */
  get $_activeHasAllStoppedEvents() {
    return this.$_active.length && (!this.$_active.some((ev) => !ev.isStopped));
  }

  get $_activeHasErrors() {
    return this.$_active.some((ev) => ev.hasError);
  }

  /**
   * record completed values into the mirrors' value
   * and empty $_active of all pending
   */
  $commit() {
    if (!this.$_activeHasAllStoppedEvents) {
      return;
    }

    // if there are no errors, advance the last change
    if (!this.$_activeHasErrors) {
      const latest = this.$lastChange;

      if (latest) {
        this.$next(latest.value);
      }
    } else {
      console.log('--- cannot clean $commit - has errors:', this.$_active.some((ev) => ev.hasError));
    }

    // erase all the events in $_active
    this.$_active = [];
  }

  /**
   * on an event failure, flush the active events of the event
   * and any event after it. Also, force any open events to fail which
   * will ultimately clear all events and triggers the side effects of that
   * all the way up the chain unless one of the events is capable of
   * stopping the chain reaction
   * @param evt {MirrorEvent}
   */
  $reset(evt) {
    this.$_removeFromActive(evt, true);
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
   * @returns {MirrorEvent}
   */
  $send(type, value) {
    const evt = new MirrorEvent(value, type, this);
    this.$events.next(evt);
    return evt;
  }

  /**
   *
   * @param type {scalar}
   * @param handler {function}
   * @returns {Subscription | void | Unsubscribable | Promise<PushSubscription>}
   */
  $on(type, handler) {
    const target = this;
    return this.$events.pipe(filter((e) => {
      const sameType = e.$type === type;
      // console.log('$on: test = ', type, 'event = ', e.value, '/', e.$type, 'result =', sameType);
      return sameType;
    }))
      .subscribe({
        next(e) {
          if (e.isStopped) {
            return;
          }
          try {
            handler(e.value, e, target);
          } catch (err) {
            console.log('--- error on handler: ', err);
            if (!e.isStopped) {
              e.error(err);
            }
          }
        },
      });
  }
};

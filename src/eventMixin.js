import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import {
  EVENT_TYPE_ACCEPT_FROM,
  EVENT_TYPE_ACTION,
  EVENT_TYPE_FLUSH_ACTIVE,
  EVENT_TYPE_NEXT,
  EVENT_TYPE_REMOVE_FROM,
  EVENT_TYPE_VALIDATE,
} from './constants';
import { compact, isArr, isNumber } from './utils';

export default (BaseClass) => class WithEvents extends BaseClass {
  constructor(...args) {
    super(...args);

    this.$on(EVENT_TYPE_NEXT, (value, evt, target) => {
      target.$_pushActive(evt);
    });

    this.$on(EVENT_TYPE_VALIDATE, (srcEvt, evt, target) => {
      if ((!evt.hasError) && target.$_hasChildren) {
        target.$children.forEach((child) => {
          if (!evt.hasError) {
            child.$send(EVENT_TYPE_VALIDATE, srcEvt);
          }
        });
      }
    });

    this.$on(EVENT_TYPE_FLUSH_ACTIVE, (evt, commitEvt, target) => {
      if (evt.hasError) {
        target.$root.$send(EVENT_TYPE_REMOVE_FROM, evt.$order, true);
        commitEvt.error(evt.thrownError);
      }
      target.$root.$send(EVENT_TYPE_ACCEPT_FROM, evt.$order);
    });

    this.$on(EVENT_TYPE_REMOVE_FROM, (order, event, target) => {
      target.$children.forEach((child) => {
        child.$send(EVENT_TYPE_REMOVE_FROM, order, true);
      });

      target.$_removeFromActive(order, true);
    });

    this.$on(EVENT_TYPE_ACCEPT_FROM, (order, event, target) => {
      const actions = target.$_allActive;
      const inAction = actions.find((otherEvt) => otherEvt.$type === EVENT_TYPE_ACTION && otherEvt.$isBefore(order));
      if (inAction) {
        return;
      }

      target.$children.forEach((child) => {
        child.$send(EVENT_TYPE_ACCEPT_FROM, order);
      });

      const last = target.$lastChange;

      if (last && !last.$isBefore(order)) {
        target.$next(last.value);
      }

      target.$_removeFromActive(order, true);
    });
  }

  get $events() {
    if (!this.$_events) {
      this.$_events = new Subject();
    }
    return this.$_events;
  }

  get $_active() {
    if (!this.$__active) {
      this.$__active = [];
    }
    return this.$__active;
  }

  get $_allActive() {
    if (this.$parent) {
      return this.$root.$_downActive;
    }
    let active = [...this.$_active];
    if (this.$_hasChildren) {
      this.$children.forEach((child) => {
        active = compact([...active, ...child.$_downActive]);
      });
    }
    return active;
  }

  get $_downActive() {
    let active = [...this.$_active];
    if (this.$_hasChildren) {
      this.$children.forEach((child) => {
        active = compact([...active, ...child.$_downActive]);
      });
    }
    return active;
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
   * removes an event from the Active array
   * @param evt {MirrorEvent|Number}
   * @param removeAfter {boolean}
   */
  $_removeFromActive(evt, removeAfter = false) {
    let active = [...this.$_active];

    if (removeAfter) {
      active = active.filter((other) => other.$isBefore(evt));
    } else if (isNumber(evt)) {
      active = active.filter((other) => other.$order !== evt);
    } else {
      active = active.filter((other) => !other.matches(evt));
    }
    if (active.length !== this.$_active.length) {
      this.$_active = active;
    }
  }

  /**
   * register an in-process action into the queue;
   *
   * @param evt {MirrorEvent}
   * @returns {MirrorEvent}
   */
  $_pushActive(evt) {
    this.$_active = [...this.$_active, evt];
    return evt;
  }

  get $_activeErrors() {
    return this.$_allActive.filter((ev) => ev.hasError);
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
   * @param forceComplete {boolean}
   * @returns {MirrorEvent}
   */
  $send(type, value, forceComplete = false) {
    const evt = new MirrorEvent(value, type, this);
    this.$events.next(evt);
    if (forceComplete && !(evt.isStopped)) {
      evt.complete();
    }
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
          if (!e.isStopped) {
            try {
              handler(e.value, e, target);
            } catch (err) {
              console.log('--- error on handler: ', err);
              if (!e.isStopped) {
                e.error(err);
              }
            }
          }
        },
      });
  }
};

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
      target.$_addToChangeBuffer(evt);
    });

    this.$on(EVENT_TYPE_VALIDATE, (changeEvent, evt, target) => {
      if ((target.$_hasChildren) && (!evt.hasError) && (!changeEvent.hasError)) {
        target.$children.forEach((child) => {
          if (!changeEvent.hasError) {
            child.$send(EVENT_TYPE_VALIDATE, changeEvent);
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

      target.$_removeFromBuffer(order, true);
    });

    this.$on(EVENT_TYPE_ACCEPT_FROM, (order, event, target) => {
      const actions = target.$_allBuffers;
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

      target.$_removeFromBuffer(order, true);
    });
  }

  get $events() {
    if (!this.$_events) {
      this.$_events = new Subject();
    }
    return this.$_events;
  }

  get $_changeBuffer() {
    if (!this.$__buffer) {
      this.$__buffer = [];
    }
    return this.$__buffer;
  }

  get $_allBuffers() {
    if (this.$parent) {
      return this.$root.$_downBuffers;
    }
    let active = [...this.$_changeBuffer];
    if (this.$_hasChildren) {
      this.$children.forEach((child) => {
        active = [...active, ...child.$_downBuffers];
      });
    }
    return compact(active);
  }

  get $_downBuffers() {
    let active = [...this.$_changeBuffer];
    if (this.$_hasChildren) {
      this.$children.forEach((child) => {
        active = [...active, ...child.$_downBuffers];
      });
    }
    return compact(active);
  }

  set $_changeBuffer(list) {
    if (isArr(list)) {
      this.$__buffer = list;
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
  $_removeFromBuffer(evt, removeAfter = false) {
    let buffer = [...this.$_changeBuffer];

    if (removeAfter) {
      buffer = buffer.filter((other) => other.$isBefore(evt));
    } else if (isNumber(evt)) {
      buffer = buffer.filter((other) => other.$order !== evt);
    } else {
      buffer = buffer.filter((other) => !other.matches(evt));
    }
    if (buffer.length !== this.$_changeBuffer.length) {
      this.$_changeBuffer = buffer;
    }
  }

  /**
   * register an in-process action into the queue;
   *
   * @param evt {MirrorEvent}
   * @returns {MirrorEvent}
   */
  $_addToChangeBuffer(evt) {
    this.$_changeBuffer = [...this.$_changeBuffer, evt];
    return evt;
  }

  get $lastChange() {
    if (!this.$__buffer) {
      return null;
    }
    return this.$_changeBuffer.reduce((last, next) => {
      if ((next.$type === EVENT_TYPE_NEXT) && (!next.hasError)) {
        return next;
      }
      return last;
    }, null);
  }

  /**
   *
   * @param type {string|Symbol} the event type
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
   * @param type {string|Symbol}
   * @param handler {function}
   * @returns {Subscription | void | Unsubscribable | Promise<PushSubscription>}
   */
  $on(type, handler) {
    const target = this;
    return this.$events.pipe(filter((e) => e.$type === type))
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

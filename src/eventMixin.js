import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import {
  EVENT_TYPE_ACCEPT_AFTER, EVENT_TYPE_ACTION, EVENT_TYPE_NEXT, EVENT_TYPE_REMOVE_AFTER,
} from './constants';
import { compact, isArr } from './utils';

export default (BaseClass) => class WithEvents extends BaseClass {
  constructor(...args) {
    super(...args);

    this.$on(EVENT_TYPE_NEXT, (value, evt, target) => {
      target.$_pushActive(evt);
    });

    this.$on(EVENT_TYPE_REMOVE_AFTER, (order, event, target) => {
      target.$children.forEach((child) => {
        child.$send(EVENT_TYPE_REMOVE_AFTER, order, true);
      });

      const remaining = target.$_active.filter(
        (trans) => (trans.order < order),
      );
      if (remaining.length !== this.$_active.length) {
        this.$_active = remaining;
      }
    });

    this.$on(EVENT_TYPE_ACCEPT_AFTER, (order, event, target) => {
      const actions = target.$_allActive;
      const inAction = actions.find((otherEvt) => otherEvt.$type === EVENT_TYPE_ACTION && otherEvt.$isBefore(order));
      if (inAction) return;

      target.$children.forEach((child) => {
        child.$send(EVENT_TYPE_ACCEPT_AFTER, order);
      });

      const last = target.$lastChange;

      if (last && !last.$isBefore(order)) {
        target.$next(last.value);
      }

      const remaining = target.$_active.filter(
        (trans) => (trans.order < order),
      );
      if (remaining.length !== this.$_active.length) {
        this.$_active = remaining;
      }
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
   * @param evt {MirrorEvent}
   * @param removeAfter {boolean}
   */
  $_removeFromActive(evt, removeAfter = false) {
    this.$_active = this.$_active.filter((other) => !other.matches(evt) || (removeAfter && other.$isBefore(evt)));
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
    const active = this.$_allActive;
    return active.length && (!active.some((ev) => !ev.isStopped));
  }

  get $_activeHasErrors() {
    return this.$_allActive.some((ev) => ev.hasError);
  }

  get $_activeErrors() {
    return this.$_allActive.filter((ev) => ev.hasError).map((ev) => ev.thrownError);
  }

  /**
   * record completed values into the mirrors' value
   * and empty $_active of all pending
   * @param evt {MirrorEvent}
   */
  $commit(evt) {
    // const debug = this.$name === 'betaField';
    if (!this.$_activeHasAllStoppedEvents) {
      const active = this.$_allActive.filter((e) => !e.isStopped);
      console.log('not committing', this, ': still active = ', active);
      return;
    }

    // if there are no errors, advance the last change
    if (!this.$_activeHasErrors) {
      const change = evt || this.$lastChange;
      if (change) {
        this.$send(EVENT_TYPE_ACCEPT_AFTER, change.$order, true);
      }
    } else {
      console.log('--- cannot clean $commit - has errors:', this.$_active.some((ev) => ev.hasError));
    }
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
   * @param isComplete {boolean} whether to force the event to complete
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

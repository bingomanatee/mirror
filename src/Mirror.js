import { BehaviorSubject, Subject, of } from 'rxjs';
import {
  tap, distinctUntilChanged, flatMap, map, filter,
} from 'rxjs/operators';
import isEqual from 'lodash/isEqual';
import {
  ACTION_NEXT, PHASE_DEFAULT_LIST, PHASE_DO, PHASE_INIT, SKIP, UNHANDLED,
} from './constants';
import Event from './Event';
import ErrorWrapper from './ErrorWrapper';
import mapEmitter from './mapEmitter';
import { asUserAction } from './utils';

/**
 * mirror is the most atomic element in the Mirror class system - it has a single value,
 * and operates like a BehaviorSubject with the exception that it can have actions
 * and emits change events
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, options) {
    super(value);
    this.$on(ACTION_NEXT, (evt) => {
      evt.subscribe({
        complete: () => {
          super.next(evt.value);
        },
        error: (err) => {
          this.error(err);
        },
      });
    });
    if (options) {
      this._$config(options);
    }
  }

  _$config(options) {
    if (typeof options === 'string') {
      this.name = options;
    } else if (typeof options === 'object') {
      const {
        name,
        actions,
      } = options;
      if (name) this.name = name;
      if (actions && typeof actions === 'object') {
        this.$addActs(actions);
      }
    }
  }

  /**
   * intercepts updates and expresses them as events;
   * @param value
   */
  next(value) {
    this.$send(ACTION_NEXT, value);
  }

  /**
   * Sends an event through the events stream.
   *
   * This does not do anything directly but triggers any responders to a given event
   * to act.
   *
   * If the event is not intercepted(comleted or errored out) by a listener the event
   * will be force-completed to trigger any cleanup activity
   * that an intereptor may be waiting for.
   *
   * @param action {Any} preferrably a Symbol
   * @param value {any} the action payload
   * @returns {Event}
   */
  $send(action, value) {
    const event = new Event(value, action, this);
    if (this.debug) console.log('sending event:', event.action);
    this.$events.next(event);
    if (this.debug) console.log('done sending event:', event.action);
    if (!event.isStopped) event.complete();
    return event;
  }

  $do(name, ...args) {
    const {
      thrownError,
      value,
    } = this.$send(asUserAction(name), {
      args,
      result: UNHANDLED,
    });
    if (thrownError) throw thrownError;
    if (value.result === UNHANDLED) {
      console.warn('unhandled user action', name, 'called with ', ...args);
    }
    return value.result;
  }

  /**
   * define a user action hook for a names action
   * @param name
   * @param handler
   * @returns {Subscription}
   */
  $addAct(name, handler) {
    if (typeof handler !== 'function') throw new Error(`$act requires function for ${name}`);
    const target = this;
    const subscription = this.$on(asUserAction(name), (evt) => {
      const { args } = evt.value;
      const result = handler(target, ...args);
      evt.next({
        ...evt.value,
        result,
      });
    }, PHASE_DO);
    this._$registerAct(name, handler, subscription);
  }

  $addActs(obj) {
    Object.keys(obj)
      .forEach((name) => {
        const handler = obj[name];
        if (typeof handler === 'function') {
          this.$addAct(name, handler);
        }
      });
  }

  $remAct(name) {
    try {
      if (this._$acts && this._$acts.has(name)) {
        const { sub } = this._$acts;
        if (sub) {
          sub.unsubscribe();
        }
      }
    } catch (err) {

    }
    this._$acts.delete(name);
  }

  _$registerAct(name, handler, sub) {
    if (!this._$acts) {
      this._$acts = new Map();
    }
    this.$remAct(name);

    this._$acts.set(name, {
      name,
      handler,
      sub,
    });
  }

  /**
   * every event that is set to it is run through the PHASE_DEFAULT_LIST and emitted with its phase
   * set to the phases in series, unless the event is stopped/completes/errors out
   *
   * also for some reason the last event seems to be repeating, so the distinct operator
   * blocks this abberation til I can track down the root cause.
   * @returns {Observable<Event>}
   */
  get $events() {
    if (!this._$events) {
      this._$events = new Subject()
        .pipe(
          flatMap((event) => of(...PHASE_DEFAULT_LIST)
            .pipe(
              map(
                (phase) => (event.isStopped ? SKIP : Object.assign(event, { phase })),
              ),
            )),
          filter((evt) => evt !== SKIP),
          distinctUntilChanged(
            Event.eventsMatch,
            (evt) => ((evt instanceof Event) ? evt.toJSON() : evt),
          ),
        );
    }
    return this._$events;
  }

  $on(action, handler, phase = PHASE_DO) {
    return this.$events.subscribe({
      next(evt) {
        if (evt.isStopped) return;
        if (evt.action === action && evt.phase === phase) {
          try {
            handler(evt);
          } catch (err) {
            if (!evt.isStopped) evt.error(evt);
          }
        }
      },
    });
  }

  /**
   * ---------------- PROXIES ------------------
   * These are quick aliases for access to values and actions.
   * They rely on Proxy which is not universally accessible (F**king IE);
   */

  get $p() {
    if (!this._$p) {
      this._$p = new Proxy(this, {
        get(target, key) {
          if (target.$children) // is a collection
          {
            if (target.$children.has(key)) return target.$children.get(key).value;
          }
          if (target._$acts.has(key)) {
            return (...args) => target.$do(key, ...args);
          }
          // name is not a proxied value; directly refer to the target
          return target[key];
        },
        set: this.$set ? (target, key, value) => target.$set(key, value) : undefined,
      });
    }
    return this._$p;
  }
}

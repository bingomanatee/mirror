import {
  BehaviorSubject, Subject, of, combineLatest,
} from 'rxjs';
import {
  tap, distinctUntilChanged, flatMap, map, filter,
} from 'rxjs/operators';
import isEqual from 'lodash/isEqual';
import {
  ACTION_NEXT, PHASE_DEFAULT_LIST, PHASE_ON, PHASE_INIT, SKIP, UNHANDLED, identity,
} from './constants';
import Event from './Event';
import ErrorWrapper from './ErrorWrapper';
import mapEmitter from './mapEmitter';
import { asUserAction } from './utils';

/**
 * mirror is the most atomic element in the Mirror class system - it has a single value,
 * and operates like a BehaviorSubject with the exception that it can have actions
 * and emits change events
 *
 * Because Mirror extends BehaviorSubject, to insulate
 * Mirror against future revisions of the BehaviorSubject class,
 * all methods/properties are $ or _$ (or _$$) prefixed.
 *
 * public methods/properties  are prefixed with `$`
 * private methods/properties are prefixed with `_$`
 * local values of private methods are prefixed with `_$$`
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, options) {
    super(value);
    if (options) {
      this._$config(options);
    }
    this.$on(ACTION_NEXT, (evt) => {
      evt.subscribe({
        complete: () => {
          super.next(evt.value);
        },
        error: (err) => {
          console.log('next aborted: ', err);
        },
      });
    });

    const self = this;
    this.$events.subscribe({
      next(evt) {
        if (evt && evt.subscribe) {
          evt.subscribe({
            error(err) {
              console.log('error in mirror: ', err, self.name || self);
              if (err && err.thrown) {
                console.log('thrown:', err.thrownError);
              }
            },
          });
        }
      },
      error(err) {},
    });

    this._$constructed = true;
    this._$value = value;
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
    this.$events.next(event);
    if (!event.isStopped) event.complete();
    return event;
  }

  $act(name, ...args) {
    const evt = this.$send(asUserAction(name), {
      args,
      result: UNHANDLED,
    });
    if (evt) {
      if (evt.thrownError) {
        throw evt.thrownError;
      }
    } else {
      console.warn('$act did not return event.');
      return;
    }
    if (evt.value.result === UNHANDLED) {
      console.warn('unhandled user action', name, 'called with ', ...args);
    }
    return evt.value.result;
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
    const sub = this.$on(asUserAction(name), (evt) => {
      const { args } = evt.value;
      const result = handler(target, ...args);
      evt.next({
        ...evt.value,
        result,
      });
    }, PHASE_ON);

    this.$remAct(name);

    const proxy = (...args) => {
      const evt = this.$act(name, ...args);
      return evt ? evt._value : undefined;
    };

    this._$acts.set(name, {
      name,
      handler,
      sub,
      proxy,
    });
  }

  get _$acts() {
    if (!this._$$acts) {
      this._$$acts = new Map();
    }
    return this._$$acts;
  }

  $hasAction(key) {
    return this._$$acts && this._$$acts.has(key);
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
    if (this._$$acts && this._$acts.has(name)) {
      const { sub } = this._$acts;
      if (sub) {
        sub.unsubscribe();
      }
      this._$acts.delete(name);
    }
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

  $on(action, handler, phase = PHASE_ON) {
    return this.$events.subscribe({
      next(evt) {
        if (evt.isStopped) return;
        if (evt.action === action && evt.phase === phase) {
          try {
            handler(evt);
          } catch (err) {
            console.log('$on hander --- thrown error from ', handler.toString());
            console.log('thrown: ', err);
            if (!evt.isStopped) evt.error(evt);
          }
        }
      },
    });
  }

  /**
   * ----------------- transactions ------------------
   * We use transactions to muffle subscriptions so we have an out transmitter
   * that we relay messages from the native stream to when transcations are not active.
   *
   * As this is extended behavior we don't alter the core subscription pattern
   * but allow $subscription(...) to muffled output (below).
   *
   * @returns {BehaviorSubject}
   */

  get _$transStream() {
    if (!this._$$transStream) {
      this._$$transStream = new BehaviorSubject(new Set());
    }
    return this._$$transStream;
  }

  $remTrans(subject) {
    const transSets = this._$activeTrans;
    transSets.delete(subject);
    this._$transStream.next(transSets);
  }

  /**
   *
   * @returns {Set<any>}
   * @private
   */
  get _$activeTrans() {
    const activeTrans = new Set();
    this._$transStream.value.forEach((trans) => {
      if (!trans.isStopped) {
        activeTrans.add(trans);
      }
    });

    return activeTrans;
  }

  /**
   * blocks broacast out of $subscribe until the returned stream is stopped.
   *
   * @param subject {Subject?} a subject that will block transmission until stopped;
   *       created if not provided.
   * @returns {Subject}
   */
  $trans(subject) {
    if (!subject) return this.$trans(new Subject());

    const transSets = this._$activeTrans;
    transSets.add(subject);
    const self = this;

    subject.subscribe({
      complete() {
        self.$remTrans(subject);
      },
      error() {
        self.$remTrans(subject);
      },
    });
    this._$transStream.next(transSets);
    return subject;
  }

  get _$outThrottled() {
    if (!this._$$outThrottled) {
      const self = this;
      this._$$outThrottled = combineLatest(this._$transStream, self)
        .pipe(
          filter(([trans]) => !trans.size),
          map((streams) => streams[1]),
          distinctUntilChanged(),
        );

      this._$$outThrottled.subscribe((v) => {
        self._$value = v;
      }, identity);
    }

    return this._$$outThrottled;
  }

  /**
   * the transaction-throttled value.
   * Also, happily, won't thrown an
   * @returns {*}
   */
  get $value() {
    return this._$value;
  }

  /**
   * ----------------- transactional subscribe -------------------
   * This emits only in the absence of transactional lock(s);
   * note- it also has a distinctUntilChanged() operator in its pipe
   * so it may also be less noisy even without transactions.
   *
   * @param args {manager}
   * @returns {Subscription}
   */

  $subscribe(...args) {
    return this._$outThrottled.subscribe(...args);
  }

  /**
   * ---------------- PROXIES ------------------
   * These are quick aliases for access to values and actions.
   * They rely on Proxy which is not universally accessible (F**king IE);
   */
  get $proxy() {
    return this.$p;
  }

  /**
   * a proxy for the mirror that is a flatter object with accessors
   * corresponding to the actions (if any).
   *
   * @returns {Mirror|*}
   */
  get $p() {
    if (!this._$p) {
      this._$p = new Proxy(this, {
        get(target, key) {
          try {
            if (target._$acts.has(key)) {
              return target._$acts.get(key).proxy;
            }
            // name is not a proxied value; directly refer to the target
            return target[key];
          } catch (err) {
            console.log('error getting', key);
            console.log('from', target);
            console.warn(err);
          }
        },
      });
    }
    return this._$p;
  }

  get $do() {
    if (!this._$do) {
      this._$do = new Proxy(this, {
        get(target, key) {
          if (target.$hasAction(key)) {
            return target._$acts.get(key).proxy;
          }
          return identity;
        },
      });
    }
    return this._$do;
  }

  get do() {
    console.warn('deprecated: use $do or $p');
    return this.$do;
  }

  get $my() {
    return this.$p;
  }

  get my() {
    console.warn('deprecated; use $my or $p');
    return this.$p;
  }
}

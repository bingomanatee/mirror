import { BehaviorSubject } from 'rxjs';
import { PHASE_INIT } from './constants';

/**
 * event is a subscribable that has a few non-changeable annotations.
 * also, copies the value into last so that on an error you can see
 * the last non-erroneous value
 */
export default class Event extends BehaviorSubject {
  /**
   *
   * @param value {any}
   * @param action {scalar} the event type; pref. a constant/Symbol
   * @param target? {the subject that the event was originally broadcast to}
   */
  constructor(value, action, target) {
    super(value);
    this._action = action;
    this._target = target;
    this._last = value;
    const self = this;
    this.phase = PHASE_INIT;
    this.subscribe({
      next(v) { self._last = v; },
      error() {},
    });
  }

  get last() {
    return this._last;
  }

  get action() {
    return this._action;
  }

  get target() {
    return this._target;
  }

  toJSON() {
    return {
      value: this.value,
      phase: this.phase,
      action: this.action,
    };
  }
}

Event.eventsMatch = (evA, evB) => {
  if (!(evA instanceof Event) || !(evB instanceof Event)) {
    return false;
  }
  return (evA.action === evB.action)
    && (evA.phase === evB.phase)
    && (evA.value === evB.value);
};

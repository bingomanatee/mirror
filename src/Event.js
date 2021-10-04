import { BehaviorSubject, Subject } from 'rxjs';
import { ABSENT } from './constants';
import { e } from './utils';

/**
 * registers a change to a specific field.
 */
export default class Event extends BehaviorSubject {
  constructor(target, value, parentEvent = ABSENT) {
    super(value);
    this.$_target = target;
    this.$_parentEvent = parentEvent;
  }

  /**
   * ordinarily BS blocks access to values after completion.
   * @returns {*}
   */
  get $value() {
    return this._value;
  }

  /**
   *
   * @returns {Subject}
   */
  get $_parentEvent() {
    return this.$__parentEvent;
  }

  /**
   *
   * @param pe {Subject}
   */
  set $_parentEvent(pe) {
    if (pe) {
      const self = this;
      this.subscribe({
        error(er) {
          if (!pe.isStopped) {
            pe.error(e(er, { from: self }));
          }
        },
      });
    }
  }
}

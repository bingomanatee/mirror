import { BehaviorSubject, Subject } from 'rxjs';
import { ABSENT } from './constants';
import { e } from './utils';

/**
 * registers a change to a specific field.
 * note the value can be a mutator to the target indicated as
 * {[MUTATOR]: fn}
 */
export default class ChangeEvent extends BehaviorSubject {
  constructor(target, value, parentEvent = ABSENT) {
    super(value);
    this.$_target = target;
    this.$_parentEvent = parentEvent;
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
    this.$__parentEvent = pe;
  }
}

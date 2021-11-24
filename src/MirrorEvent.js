import { BehaviorSubject } from 'rxjs';
import idGen from './idGen';

export default class MirrorEvent extends BehaviorSubject {
  constructor(props, type, target) {
    super(props);
    this.$type = type;
    this.$target = target;
    this.$id = idGen();
  }

  /**
   * events' values persist even past their closure
   * @returns {T}
   */
  getValue() {
    return this._value;
  }
}

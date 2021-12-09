import { BehaviorSubject } from 'rxjs';
import idGen from './idGen';
import { isNumber } from './utils';

let order = 0;
export default class MirrorEvent extends BehaviorSubject {
  constructor(props, type, target) {
    super(props);
    this.$type = type;
    this.$target = target;
    this.$id = idGen();
    this.$order = order;
    order += 1;
  }

  /**
   * events' values persist even past their closure
   * @returns {any}
   */
  getValue() {
    return this._value;
  }

  matches(other) {
    return ((other === this) || (other === this.$id));
  }

  $isAfter(other) {
    if (isNumber(other)) {
      return this.$order > other;
    }
    if (other instanceof MirrorEvent) {
      return this.$isAfter(other.$order);
    }
    return false;
  }

  $isBefore(other) {
    if (isNumber(other)) {
      return this.$order < other;
    }
    if (other instanceof MirrorEvent) {
      return this.$isBefore(other.$order);
    }
    return false;
  }
}

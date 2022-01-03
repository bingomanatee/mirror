import { BehaviorSubject } from 'rxjs';
import idGen from './idGen';
import { isNumber } from './utils';
import { MIRROR_EVENT_STATE_ACTIVE, MIRROR_EVENT_STATE_COMPLETE, MIRROR_EVENT_STATE_ERROR } from './constants';

let order = 0;
export default class MirrorEvent {
  constructor(value, type, target) {
    this.value = value;
    this.$type = type;
    this.$target = target;
    this.$id = idGen();
    this.$order = order;
    order += 1;
    this._state = MIRROR_EVENT_STATE_ACTIVE;
  }

  get state() {
    return this._state;
  }

  set state(state) {
    if (!this.isStopped) {
      this._state = state;
    }
  }

  get hasError() {
    return this.state === MIRROR_EVENT_STATE_ERROR;
  }

  get isStopped() {
    return this.state !== MIRROR_EVENT_STATE_ACTIVE;
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

  error(err) {
    this.state = MIRROR_EVENT_STATE_ERROR;
    this.thrownError = err;
  }

  complete() {
    this.state = MIRROR_EVENT_STATE_COMPLETE;
  }
}

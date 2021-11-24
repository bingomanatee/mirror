import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import { EVENT_TYPE_NEXT } from './constants';

export default class Mirror extends eventMixin(BehaviorSubject) {
  constructor(value) {
    super(value);
  }

  next(value) {
    this.$send(EVENT_TYPE_NEXT, value);
  }

  $next(value) {
    super.next(value);
  }

  getValue() {
    const last = this.$lastChange;
    if (last) return last.value;
    return super.getValue();
  }
}

Object.assign(Mirror.prototype, eventMixin);

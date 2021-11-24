import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import { EVENT_TYPE_NEXT } from './constants';

export default class Mirror extends BehaviorSubject {
  constructor(value) {
    super(value);
    this.$_initEvents();
  }

  next(value) {
    this.$send(EVENT_TYPE_NEXT, value);
  }

  $next(value) {
    super.next(value);
  }
}

Object.assign(Mirror.prototype, eventMixin);

import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import actionMixin from './actionMixin';
import { EVENT_TYPE_NEXT } from './constants';
import { isObj, isFn } from './utils';

export default class Mirror extends actionMixin(eventMixin(BehaviorSubject)) {
  constructor(value, config) {
    super(value, config);
    config && this.$_config(config);
  }

  $_config(config) {
    if (!isObj(config)) {
      return;
    }

    const { test } = config;

    if (isFn(test)) {
      this.$addTest(test);
    }
  }

  next(value) {
    const evt = this.$send(EVENT_TYPE_NEXT, value);
    if (!evt.isStopped) {
      evt.complete();
    }
    if (evt.hasError) {
      throw evt.thrownError;
    }
  }

  $addTest(handler) {
    return this.$on(EVENT_TYPE_NEXT, (value, evt, tgt) => {
      let err = null;
      try {
        err = handler(value, tgt);
      } catch (er) {
        err = er;
      }
      if (err && !evt.isStopped) {
        evt.error(err);
      }
    });
  }

  $next(value) {
    super.next(value);
  }

  getValue() {
    const last = this.$lastChange;
    if (last) {
      return last.value;
    }
    return super.getValue();
  }
}

Object.assign(Mirror.prototype, eventMixin);

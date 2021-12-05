import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import actionMixin from './actionMixin';
import { EVENT_TYPE_NEXT } from './constants';
import { isObj, isFn, asImmer } from './utils';
import propsMixin from './propsMixin';

export default class Mirror extends propsMixin(actionMixin(eventMixin(BehaviorSubject))) {
  constructor(value, config) {
    super(asImmer(value), config);
    this.$_config(config);
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
    const evt = this.$send(EVENT_TYPE_NEXT, value, true);

    if (evt.hasError) {
      throw evt.thrownError;
    }
    this.$commit();
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

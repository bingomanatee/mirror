import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import actionMixin from './actionMixin';
import idGen from './idGen';
import {
  EVENT_TYPE_ACCEPT_AFTER, EVENT_TYPE_DEBUG, EVENT_TYPE_NEXT, EVENT_TYPE_REMOVE_AFTER,
} from './constants';
import {
  isObj, isFn, asImmer, isStr,
} from './utils';
import propsMixin from './propsMixin';
import childMixin from './childMixin';

export default class Mirror extends childMixin(propsMixin(actionMixin(eventMixin(BehaviorSubject)))) {
  constructor(value, config) {
    super(asImmer(value), config);
    this.$_config(config);
  }

  $_config(config) {
    if (!isObj(config)) {
      return;
    }

    const { test, name, debug } = config;

    if (isFn(test)) {
      this.$addTest(test);
    }
    if (isStr(name, true)) {
      this.$name = name;
    } else {
      this.$name = idGen();
    }
    this.$_debug = debug;
  }

  get $debug() {
    if (this.$_debug) return true;
    if (this.$parent) {
      return this.$parent.$debug;
    }
    return false;
  }

  $note(msg, value = null) {
    if (this.$debug) {
      this.$send(EVENT_TYPE_DEBUG, {
        msg,
        target: this.$name,
        value,
      });
    }
  }

  next(value) {
    const evt = this.$send(EVENT_TYPE_NEXT, value, true);
    let errors = this.$_activeErrors;
    if (errors.length) {
      this.$root.$send(EVENT_TYPE_REMOVE_AFTER, evt.$order, true);
      if (errors.length === 1) {
        // eslint-disable-next-line prefer-destructuring
        errors = errors[0];
      }
      this.$note('--- next; has errors', {
        value,
        active: this.$_allActive.map((e) => ({ ...e })),
      });
      throw errors;
    } else {
      this.$note('--- next: no errors', {
        value,
        active: this.$_allActive.map((e) => ({ ...e })),
      });
    }
    this.$root.$send(EVENT_TYPE_ACCEPT_AFTER, evt.$order);
  }

  $addTest(handler) {
    return this.$on(EVENT_TYPE_NEXT, (value, evt, tgt) => {
      tgt.$note('testing', {
        value,
        handler,
        target: tgt.$name,
      });

      let err = null;
      try {
        err = handler(value, tgt);
      } catch (er) {
        err = er;
      }
      if (err) {
        if (evt.isStopped) {
          tgt.$note('error -- throwing', { err, target: tgt.$name });
          throw err;
        }
        tgt.$note('error -- to event', { err, target: tgt.$name });
        evt.error(err);
      }
    });
  }

  $next(value) {
    super.next(value);
  }

  getValue() {
    const last = this.$lastChange;
    const value = last ? last.value : super.getValue();
    if (this.$_hasChildren) {
      return this.$_withChildValues(value);
    }
    return value;
  }
}

Object.assign(Mirror.prototype, eventMixin);

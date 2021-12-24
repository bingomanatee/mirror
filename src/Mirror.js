import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import actionMixin from './actionMixin';
import idGen from './idGen';
import {
  EVENT_TYPE_FLUSH_ACTIVE,
  EVENT_TYPE_DEBUG,
  EVENT_TYPE_NEXT,
  EVENT_TYPE_VALIDATE,
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

    const {
      test,
      name,
      debug = false,
    } = config;

    if (isFn(test)) {
      this.$addTest(test);
    }
    this.$name = isStr(name, true) ? name : idGen();
    this.$_debug = debug;
  }

  get $debug() {
    if (this.$_debug) {
      return true;
    }
    if (this.$parent) {
      return this.$parent.$debug;
    }
    return false;
  }

  $note(msg, value = null) {
    if (this.$debug) {
      if (this.$debug > 1) {
        console.log('target: ', this.$name, msg, value);
      }
      this.$send(EVENT_TYPE_DEBUG, {
        msg,
        target: this.$name,
        value,
      });
    }
  }

  next(value) {
    const evt = this.$send(EVENT_TYPE_NEXT, value);

    if (!evt.isStopped) {
      if (this.$_hasChildren) {
        if (this.$_hasChildren) {
          evt._value = this.$_withChildValues(value);
        }
      }

      if (this.$_hasSelectors) {
        evt._value = this.$_withSelectors(evt.value);
      }

      this.$root.$send(EVENT_TYPE_VALIDATE, evt);
    }

    if (!evt.isStopped) {
      evt.complete();
    }

    this.$send(EVENT_TYPE_FLUSH_ACTIVE, evt, true);
    if (evt.hasError) {
      throw evt.thrownError;
    }
  }

  $addTest(handler) {
    return this.$on(EVENT_TYPE_VALIDATE, (srcEvt, evt, tgt) => {
      if (!srcEvt.isStopped) {
        const value = tgt.getValue();

        let err = null;
        try {
          err = handler(value, tgt);
        } catch (er) {
          err = er;
        }

        if (err) {
          tgt.$note('error -- to event', {
            err,
            target: tgt.$name,
          });
          srcEvt.error({
            target: tgt.$name,
            error: err,
          });
        }
      }
    });
  }

  $next(value) {
    super.next(value);
  }

  getValue() {
    if (this.$lastChange) {
      return this.$_withChildValues(this.$lastChange.value);
    }

    return super.getValue();
  }
}

Object.assign(Mirror.prototype, eventMixin);

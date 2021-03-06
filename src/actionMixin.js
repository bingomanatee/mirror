import produce from 'immer';
import {
  EVENT_TYPE_ACTION, EVENT_TYPE_FLUSH_ACTIVE, TYPE_ARRAY, TYPE_MAP, TYPE_OBJECT,
} from './constants';
import {
  clone, e, isFn, isObj,
} from './utils';
import { makeDoProxy } from './mirrorMisc';

export default (BaseClass) => class WithActions extends BaseClass {
  constructor(value, config, ...rest) {
    super(value, config, ...rest);

    this.$_configActions(config);

    this.$on(EVENT_TYPE_ACTION, ({
      fn,
      args,
    }, evt, target) => {
      if (!evt.isStopped) {
        target.$_addToChangeBuffer(evt);

        try {
          const result = fn(target, ...args);
          evt.value = {
            ...evt.value,
            result,
          };
        } catch (err) {
          evt.error(err);
        }

        target.$send(EVENT_TYPE_FLUSH_ACTIVE, evt, true);
      }
    });
  }

  get $_actions() {
    if (!this.$__actions) {
      this.$__actions = new Map();
    }
    return this.$__actions;
  }

  get $isInAction() {
    const action = this.$_allBuffers.find(({
      type,
      committed,
    }) => (!committed) && (type === EVENT_TYPE_ACTION));
    return !!action;
  }

  $addAction(name, fn) {
    this.$_actions.set(name, (...args) => this.$act(fn, args));
    if (typeof Proxy === 'undefined') {
      delete this.$_do;
    }
  }

  $act(fn, args) {
    const evt = this.$send(EVENT_TYPE_ACTION, {
      fn,
      args,
    }, true);
    if (evt.hasError) {
      throw evt.thrownError;
    }
    return evt.value.result;
  }

  get $do() {
    if (!this.$_do) {
      this.$_do = makeDoProxy(this);
    }
    return this.$_do;
  }

  $_configActions(config) {
    if (!isObj(config)) {
      return;
    }

    const { actions } = config;

    if (isObj(actions)) {
      Object.keys(actions)
        .forEach((name) => {
          this.$addAction(name, actions[name]);
        });
    }
  }

  $mutate(fn) {
    if (!isFn(fn)) {
      throw e('$mutate expects function', {
        source: '$mutate',
        fn,
      });
    }

    if (this.$_mutable) {
      return this.next(fn(clone(this.value)));
    }

    let next = this.value;

    try {
      next = produce(this.value, fn);
    } catch (err) {
      next = this.next(fn(clone(this.value)));
    }

    this.next(next);
  }
};

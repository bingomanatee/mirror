import {
  EVENT_TYPE_ACTION, EVENT_TYPE_FLUSH_ACTIVE,
} from './constants';
import { isFn, isObj } from './utils';
import { makeDoObj, makeDoProxy } from './mirrorMisc';

export default (BaseClass) => class WithActions extends BaseClass {
  constructor(value, config, ...rest) {
    super(value, config, ...rest);

    config && this.$_configActions(config);

    this.$on(EVENT_TYPE_ACTION, ({ fn, args }, evt, target) => {
      if (!evt.isStopped) {
        target.$_addToChangeBuffer(evt);

        try {
          fn(target, ...args);
        } catch (err) {
          evt.error(err);
        }
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
    const action = this.$_allBuffers.find(({ type, committed }) => (!committed) && (type === EVENT_TYPE_ACTION));
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
    this.$send(EVENT_TYPE_FLUSH_ACTIVE, evt, true);
    if (evt.hasError) throw evt.thrownError;
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
      throw new Error('$mutate expects function');
    }

    this.next(fn(this.value, this));
  }
};

import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import {
  EVENT_TYPE_ACCEPT_FROM, EVENT_TYPE_ACTION, EVENT_TYPE_NEXT, EVENT_TYPE_REMOVE_FROM,
} from './constants';
import { isArr, isObj, sortBy } from './utils';

function makeDoObj(target) {
  const obj = {};
  target.$_actions.forEach((fn, name) => {
    try {
      obj[name] = fn;
    } catch (e) {

    }
  });
  return obj;
}

function makeDoProxy(target) {
  if (target.$_doProxy) return target.$_doProxy;
  if (typeof Proxy === 'undefined') {
    return makeDoObj(target);
  }

  return new Proxy(target, {
    get(proxyTarget, name) {
      if (proxyTarget.$_actions.has(name)) {
        return proxyTarget.$_actions.get(name);
      }
      return () => {
        throw new Error(`no action named ${name}`);
      };
    },
  });
}

export default (BaseClass) => class WithActions extends BaseClass {
  constructor(value, config, ...rest) {
    super(value, config, ...rest);

    config && this.$_configActions(config);

    this.$on(EVENT_TYPE_ACTION, ({ fn, args }, evt, target) => {
      if (!evt.isStopped) {
        target.$_pushActive(evt);
        evt.subscribe({
          error() {
            target.$send(EVENT_TYPE_REMOVE_FROM, evt.$order);
          },
          complete() {
            target.$send(EVENT_TYPE_ACCEPT_FROM, evt.$order);
          },
        });
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
    const action = this.$_allActive.find(({ type, committed }) => (!committed) && (type === EVENT_TYPE_ACTION));
    return !!action;
  }

  $addAction(name, fn) {
    this.$_actions.set(name, (...args) => this.$act(fn, args));
    if (typeof Proxy === 'undefined') {
      delete this.$_do;
    }
  }

  $act(fn, args) {
    const evt = this.$send(EVENT_TYPE_ACTION, { fn, args });
    if (!evt.isStopped) {
      evt.complete();
    }
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
      Object.keys(actions).forEach((name) => {
        this.$addAction(name, actions[name]);
      });
    }
  }
};

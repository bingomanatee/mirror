import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import { EVENT_TYPE_ACTION, EVENT_TYPE_NEXT } from './constants';
import { isArr, isObj, sortBy } from './utils';

function makeDoProxy(target) {
  if (target.$_doProxy) return target.$_doProxy;
  // if (typeof Proxy === 'undefined') {
  //   return makeDoObj(target);
  // }

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
  constructor(value, config, ...args) {
    super(value, config, ...args);

    config && this.$_configActions(config);

    this.$on(EVENT_TYPE_ACTION, ({ fn, args }, evt, target) => {
      if (!evt.isStopped) {
        target.$_pushActive(evt);
        evt.subscribe({
          error() {
            target.$revert(evt);
          },
          complete() {
            target.$commit();
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
    return lazy(this, '$__actions', () => new Map());
  }

  $addAction(name, fn) {
    this.$_actions.set(name, (...args) => this.$act(fn, args));
  }

  $act(fn, args) {
    const evt = this.$send(EVENT_TYPE_ACTION, { fn, args });
    if (!evt.isStopped) {
      evt.complete();
    }
  }

  get $do() {
    return lazy(this, '$_do', makeDoProxy);
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

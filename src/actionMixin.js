import { Subject } from 'rxjs';
import { map, share, filter } from 'rxjs/operators';
import lazy from './utils/lazy';
import MirrorEvent from './MirrorEvent';
import {
  EVENT_TYPE_ACCEPT_FROM,
  EVENT_TYPE_ACTION,
  EVENT_TYPE_NEXT,
  EVENT_TYPE_REMOVE_FROM,
  EVENT_TYPE_SET,
  SET_RE, TYPE_ARRAY, TYPE_MAP,
  TYPE_OBJECT,
} from './constants';
import {
  isArr, isObj, isStr, isWhole, sortBy,
} from './utils';
import { ucFirst } from '../v1/utils';

function makeDoObj(target) {
  const obj = {};
  target.$_actions.forEach((fn, name) => {
    try {
      obj[name] = fn;
    } catch (e) {

    }
  });

  switch (target.$type) {
    case TYPE_OBJECT:
      Object.keys(target.value)
        .forEach((key) => {
          const setKey = `set${ucFirst(key)}`;
          obj[setKey] = (value) => target.$set(key, value);
        });
      break;

    case TYPE_MAP:
      target.value.keys()
        .forEach((key) => {
          const setKey = `set${ucFirst(key)}`;
          obj[setKey] = (value) => target.$set(key, value);
        });
      break;
  }

  return obj;
}

function makeDoProxy(target) {
  if (target.$_doProxy) {
    return target.$_doProxy;
  }
  if (typeof Proxy === 'undefined') {
    return makeDoObj(target);
  }

  return new Proxy(target, {
    get(proxyTarget, name) {
      if (proxyTarget.$_actions.has(name)) {
        return proxyTarget.$_actions.get(name);
      }

      if (isStr(name)) {
        const match = name.match(SET_RE);
        if (match) {
          const [_whole, key] = match;
          if (proxyTarget.$keyFor(key)) {
            return (value) => proxyTarget.$set(key, value);
          }
        }
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
    const evt = this.$send(EVENT_TYPE_ACTION, {
      fn,
      args,
    }, true);
    if (evt.hasError) {
      this.$root.$send(EVENT_TYPE_REMOVE_FROM, evt.$order);
      throw evt.thrownError;
    } else {
      this.$root.$send(EVENT_TYPE_ACCEPT_FROM, evt.$order);
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
      Object.keys(actions)
        .forEach((name) => {
          this.$addAction(name, actions[name]);
        });
    }
  }
};

/* eslint-disable no-param-reassign */
import { BehaviorSubject } from 'rxjs';
import {
  asMap, isArray, isFunction, isMap, isObject,
} from './utils';
import {
  CHILDREN,
  NAME_UNNAMED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';

export function mirrorType(target, value) {
  if (!target.$_type) {
    if (isMap(value)) {
      return TYPE_MAP;
    }
    if (isObject(value)) {
      return TYPE_OBJECT;
    }
    return TYPE_VALUE;
  }
  return target.$_type;
}

export function hasOrIs(target, value) {
  if (target === value) return true;
  if (!(target instanceof BehaviorSubject)) return false;
  return target.value === value;
}

export function utilLogs(target, ...args) {
  if (target.$_debug === false) return;

  let [n, message, ...rest] = args;
  if (typeof n === 'string') {
    [message, ...rest] = args;
    n = 0;
  }

  if (typeof target.$_debug === 'number') {
    if (n < target.$_debug) return;
  }

  console.warn(message, '(target:', target, ')', rest);
}

/**
 *
 * @param target {Mirror}
 * @param config {Object}
 */
export function parseConfig(target, config = {}) {
  target.$_name = NAME_UNNAMED;
  target.$_debug = false;

  if (isObject(config)) {
    Object.keys(config)
      .forEach((key) => {
        const fieldValue = config[key];
        switch (key.toLowerCase()) {
          case 'children':
            target.$addChildren(fieldValue);
            break;

          case 'type':
            target.$_type = fieldValue;
            break;

          case 'name':
            target.$_setName(fieldValue);
            break;

          case 'lockChildren':
            target.$_lockFields = !!fieldValue;
            break;

          case 'debug':
            target.$_debug = fieldValue;
            break;

          default:
            target.$_log(0, 'unknown config field ', { key });
        }
      });
  }

  let configTests = config.test || config.tests;
  if (configTests) configTests = asMap(configTests);

  if (configTests) {
    if (isObject(configTests) || isMap(configTests)) {
      if (target.$isCollection) {
        configTests.forEach((test, name) => {
          if (name === CHILDREN) return;
          if (target.$hasChild(name)) {
            target.$children.get(name).$addTest(test);
          } else {
            target.$addTest(test, name);
          }
        });
      } else {
        configTests.forEach((test, name) => {
          target.$addTest(test, name);
        });
      }

      if (configTests.has(CHILDREN)) {
        if (target.$isCollection) {
          target.$children.forEach((child, name) => {
           // const test = (value) => configTests.get(CHILDREN)(value, child, name);
           // Object.defineProperty(test, 'name', { value: name });
            child.$addTest(configTests.get(CHILDREN));
          });
        }
      }
    } else if (isArray(config.test) || isFunction(config.test)) {
      target.$addTest(config.test);
    }
  }
}

/* eslint-disable no-param-reassign */
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { isFn, isMap, isObj } from './utils';
import {
  ABSENT, NAME_UNNAMED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';

export function mirrorType(target, value = ABSENT) {
  if (value === ABSENT) value = target.value;

  if (isMap(value)) {
    return TYPE_MAP;
  }
  if (isObj(value)) {
    return TYPE_OBJECT;
  }
  return TYPE_VALUE;
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

  if (isObj(config)) {
    Object.keys(config)
      .forEach((key) => {
        const fieldValue = config[key];
        if (config.name === 'TM') {
          console.log('::::', key, fieldValue);
        }
        switch (key.toLowerCase()) {
          case 'children':
            target.$addChildren(fieldValue);
            break;

          case 'type':
            target.$_type = fieldValue;
            break;

          case 'name':
            console.log('---- setting mirror name: ', fieldValue);
            target.$_name = fieldValue;
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

  if (config.test) {
    target.$addTest(config.test);
  }
  if (config.tests) {
    target.$addTest(config.tests);
  }
}

export function testProjector(target) {
  return (value) => of(value)
    .pipe(
      filter((v) => {
        if (isFn(target.$test)) return !target.$test(v);
        return true;
      }),
      catchError(() => of()),
    );
}


export function initQueue(target) {
  target.$__queue = new Subject()
    .pipe(
      switchMap(testProjector(target)),
    );

  target.$__queue.subscribe({
    next(value) {
      target.$commit(value);
    },
    error() {
    },
    complete() {
      target.$__queue = null;
    },
  });
}

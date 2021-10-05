/* eslint-disable */
// noinspection UnreachableCodeJS

import { BehaviorSubject, Subject } from 'rxjs';
import { enableMapSet, immerable, isDraft, isDraftable, produce } from 'immer';

enableMapSet();
import {
  ABSENT, CHILDREN,
  NAME_UNNAMED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import {
  asMap, asObject, isMap, isObject, noop, maybeImmer, e, isFunction, isArray, isNumber, present
} from './utils';
import { addChild, hasChild, mirrorHas, removeChild, setParent, updateChildren } from './childParentUtils';
import { hasOrIs, utilLogs, mirrorType, parseConfig, initQueue } from './mirrorMisc';

/**
 * Mirror is a special extension of BehaviorSubject; it shards its sub-properties into children
 * which, when updated, update the parent.
 * This allows for field level validation, transactional updates and all sorts of other goodies.
 */
export default class Mirror extends BehaviorSubject {
  constructor(value, config = ABSENT) {
    super(value);
    this.$configure(config);
  }

  $configure(config = {}) {
    this.$type = mirrorType(this, this.value);
    if (!(isObject(config) || (isMap(config)))) {
      return this.$configure({});
    }
    const {
      name = NAME_UNNAMED,
      test = ABSENT,
      type = ABSENT
    } = asObject(config);
    if (present(name)) this.$name = name;
    if (present(test)) this.$_test = test;
    if (present(type)) this.$type = type;
  }

  get $test() {
    return isFunction(this.$_test) ? this.$_test : ABSENT;
  }

  get $_queue() {
    if (!this.$__queue) {
      initQueue(this);
    }
    return this.$__queue;
  };

  next(nextValue) {
    this.$_queue.next(nextValue);
  }

  $try(candidate = ABSENT) {
    if (this.$$watcher) {
      this.$$say('-------------- start', '$try', candidate);
    }
    if (this.isStopped) {
      return;
    }
    try {
      if (!present(candidate)) {
        // note -- will intentionally throw if queue was never used
        candidate = this.$__queue.value;
        if (!present(candidate)) {
          return;
        }
      }

      this.$_prior = this.getValue();

      try {
        if (isDraftable(candidate)) {
          this._value = produce(candidate, noop);
        } else {
          this._value = candidate;
        }
      } catch (err) {
        console.warn('cannot immerize prior', candidate);
        this._value = candidate;
      }
      this.$validate();
    } catch (err) {
      this.$reset();
    }
  }

  $validate() {
    if (this.$$watcher) {
      this.$$say('--start', '$validate');
    }
    let good = true;
    if (isFunction(this.$test)) {
      try {
        let error = this.$test(this.value, this);
        if (error) {
          if (this.$$watcher) {
            this.$$say('FAILED $validate', '$validate', error);
          }
          this.$_queue.error(error); // triggers reset
          good = false;
        }
      } catch (err) {
        if (this.$$watcher) {
          this.$$say('FAILED $validate', '$validate', err);
        }
        this.$_queue.error(err); // triggers reset
        good = false;
      }
    } else if (this.$$watcher) {
      this.$$say('(no testing)', '$validate');
    }
    if (good) {
      if (this.$$watcher) {
        this.$$say('PASSED $validate', '$validate');
      }
      this.$commit();
    } else {
      if (this.$$watcher) {
        this.$$say('NOT PASSED $validate', '$validate');
      }
    }
    this.$$say('--end', '$validate');
  }

  $commit() {
    if (this.isStopped) return;
    if (this.$$watcher) {
      this.$$say('----------------start', '$commit');
    }
    if (present(this.$_prior)) {
      this.$_prior = ABSENT;
    }
    if (this.$$watcher) {
      this.$$say('=============== SUPER.NEXT', '$commit', this._value);
    }
    super.next(this._value);
    if (this.$$watcher) {
      this.$$say('--end', '$commit');
    }
  }

  $reset() {
    if (this.$$watcher) {
      this.$$say('--start', '$reset');
    }
    try {
      if (present(this.$_prior)) {
        if (this.$$watcher) {
          this.$$say('resetting mirror', '$reset', {from: this._value, to: this.$_prior});
        }
        this._value = this.$_prior;
        this.$_prior = ABSENT;
      }
    } catch (err) {
      console.warn('error resetting', this, err);
      this.$_prior = ABSENT;
    }

    this.$_prior = ABSENT;

    if (this.$$watcher) this.$$say('--end', '$reset');
  }

  getValue() {

    if (!this.isStopped && present(this.$_nextValue)) {
      return this.$_nextValue;
    }

    return super.getValue();
  }
}

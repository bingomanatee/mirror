import produce from 'immer';
import { lazy } from './mirrorMisc';
import {
  ABSENT, EVENT_TYPE_CHILD_ADDED, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import { e, isThere, toMap } from './utils';
import newMirror from './newMirror';

export default (BaseClass) => class WithChildren extends BaseClass {
  get $children() {
    return lazy(this, '$_children', () => new Map());
  }

  get $_childSubs() {
    return lazy(this, '$__childSubs', () => new Map());
  }

  $addChild(name, value, type = TYPE_VALUE) {
    if (this.isStopped) {
      throw e('attempt to redefine stopped mirror', {
        target: this,
        name,
        value,
      });
    }
    const childMirror = newMirror(value, {
      name,
      type,
      parent: this,
    });

    this.$children.set(name, childMirror);
    const target = this;
    this.$_childSubs.set(name, childMirror.subscribe({
      next() {
        // on a child sub change, set the target to next;
        // child value will get mixed in.
        if (!target.$isTrying) {
          target.next(target.getValue());
        }
      },
      error(err) {
        console.log('--- child error thrown', err,
          'for child', name, 'of', target);
      },
    }));
    if (this.$_constructed) {
      this.$event(EVENT_TYPE_CHILD_ADDED, {
        name,
        childMirror,
      });
    }
    this.next(this.getValue());
  }

  /**
   * returns false if any children are invalid.
   * @returns {boolean}
   */
  get $childErrors() {
    if (!this.$isContainer) {
      return false;
    }
    if (this.$parent) {
      return this.$parent.$errors;
    }
    return false;
  }

  $_sendToChildren(value = ABSENT) {
    if (!isThere(value)) {
      value = this.$currentValue;
    }

    if (this.$isContainer) {
      const valueMap = toMap(value);
      valueMap.forEach((childValue, key) => {
        if (this.$children.has(key)) {
          this.$children.get(key).$_try(childValue);
        }
      })
    }
  }

  /**
   * override/assert child values over the current value.
   * @param value
   * @returns {symbol}
   */
  $_valueWithChildren(value = ABSENT) {
    if (!isThere(value)) {
      value = this.$current;
    }

    const target = this;
    return produce(value, (draft) => {
      target.$children.forEach((childMirror, name) => {
        switch (target.$type) {
          case TYPE_MAP:
            draft.set(name, childMirror.value);
            break;

          case TYPE_OBJECT:
            draft[name] = childMirror.value;
            break;
        }
      });
    });
  }
};

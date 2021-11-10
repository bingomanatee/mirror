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
        if (this.$children.has(key) && (this.$children.get(key).value !== childValue)) {
          this.$children.get(key).$_try(childValue);
        }
      });
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
    // if (this.$name === 'basic-xyz') {
    //   const z = this.$children.get('z');
    //   console.log('$_valueWithChildren -- child z:', z._value, 'pending', z.$_pending.value,
    //     'trial', z.$_trialValue);
    // }

    const target = this;
    const out = produce(value, (draft) => {
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

    // if (this.$name === 'basic-xyz') {
    //   console.log('... value = ', out);
    // }

    return out;
  }

  $hasChild(name) {
    // note - respecting the lazy nature of $children
    return this.$_children && this.$children.has(name);
  }

  $removeChild(name) {
    if (this.$hasChild(name)) {
      const child = this.$children.get(name);
      this.$children.delete(name);
      if (!child.isStopped) {
        child.complete();
      }
      if (this.$_childSubs.has(name)) {
        try {
          this.$_childSubs.get(name)
            .unsubscribe();
        } catch (err) {
          console.warn('childSub error unsubscribing:', err);
        }
      }
    }
  }

  $set(name, value) {
    if (!this.$isContainer) {
      throw e('cannot set to non-container', {
        name,
        value,
        target: this,
      });
    }

    let nextValue;
    if (this.$type === TYPE_MAP) {
      if (!this.value.has(name)) {
        throw e('cannot set unkeyed value ', { target: this, name, value });
      }
      nextValue = produce(this.value, (draft) => {
        draft.set(name, value);
      });
    }

    if (this.$type === TYPE_OBJECT) {
      if (!(name in this.value)) {
        throw e('cannot set unkeyed value ', { target: this, name, value });
      }
      nextValue = produce(this.value, (draft) => {
        draft[name] = value;
      });
    }

    return this.next(nextValue);
  }

  /**
   * returns an array of aliases to $set for a key.
   * note - doesn't check for existence of keys -- that is the job of $set;
   * @param key
   * @returns {*}
   */
  $_setFor(key) {
    lazy(this, '$__setFor', () => {
      const sets = new Map();
      this.$keys.forEach((key) => {
        sets.set(key, (value) => this.$set(key, value));
      });
      return sets;
    });
    if (!this.$__setFor.has(key)) {
      this.$__setFor.set(key, (value) => this.$set(key, value));
    }
    return this.$__setFor.get(key);
  }
};

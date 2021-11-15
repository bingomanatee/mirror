import produce from 'immer';
import { lazy } from './mirrorMisc';
import {
  ABSENT,
  EVENT_TYPE_CHILD_ADDED, EVENT_TYPE_COMMIT, EVENT_TYPE_COMMIT_CHILDREN,
  EVENT_TYPE_NEXT, EVENT_TYPE_REVERT,
  EVENT_TYPE_SHARD,
  EVENT_TYPE_VALIDATE,
  TYPE_MAP,
  TYPE_OBJECT,
  TYPE_VALUE,
} from './constants';
import {
  e, isThere, toMap, uniq,
} from './utils';
import { newMirror } from './newMirror';

export default (BaseClass) => class WithChildren extends BaseClass {
  constructor(...args) {
    super(...args);

    this.$on(EVENT_TYPE_NEXT, (value, p, target) => {
      if (this.$isContainer) {
        toMap(value)
          .forEach((childValue, key) => {
            if (target.$hasChild(key)) {
              const child = target.$children.get(key);
              child.$event(EVENT_TYPE_NEXT, childValue, { parent: p.id });
            }
          });
      }
    });

    this.$on(EVENT_TYPE_VALIDATE, (id, event, target) => {
      const trans = target.$_getTrans(id);
      if (trans.$isContainer) {
        let childErrors = [];
        target.$children.forEach((child) => {
          const shardTrans = child.$_getTransForParent(trans.id);
          const errors = child.$errors(shardTrans.value);
          childErrors = [...childErrors, ...errors];
        });
        target.$_addErrorsToTrans(trans, childErrors);
      }
    });

    this.$on(EVENT_TYPE_REVERT, (id, event, target) => {
      if (target.$isContainer) {
        target.$children.forEach((child) => {
          child.$_revertTrans(id);
        });
      }
    });
  }

  get $children() {
    return lazy(this, '$_children', () => new Map());
  }

  get $_childSubs() {
    return lazy(this, '$__childSubs', () => new Map());
  }

  get $root() {
    return this.$parent ? this.parent.$root : this;
  }

  get $_transOrder() {
    lazy(this, '$__transOrder', () => 0);
    const out = this.$__transOrder;
    this.$__transOrder += 1;
    return out;
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
          this.$children.get(key)
            .$_try(childValue);
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
};

import produce from 'immer';
import { e, isFn, isStr } from './utils';
import {
  EVENT_TYPE_ACTION,
  EVENT_TYPE_MUTATE,
  TYPE_MAP,
  TYPE_OBJECT,
} from './constants';
import { lazy, makeDoObj, makeDoProxy } from './mirrorMisc';

export default (BaseClass) => class WithAction extends BaseClass {
  constructor(...init) {
    super(...init);

    this.$on(EVENT_TYPE_ACTION, (action, trans, t) => {
      const { name, args } = action;
     // console.log('-- event type action: args ', args, 'trans = ', trans);
      if (!t.$_actions.has(name)) {
        throw e(`no action named ${name}`);
      } else {
        t.$_addTrans(trans);
        try {
          t.$_actions.get(name)(t, ...args);
          console.log('--- done with action', name, ' --- committing trans ', action);
          this.$commit(trans);
        } catch (err) {
          console.log('--- error with action', name, ':', err);
          t.$_removeTrans(trans.id);
        }
      }
    });

    this.$on(
      EVENT_TYPE_MUTATE,
      ({
        fn,
        args,
      }, p, t) => {
        try {
          const nextValue = produce(t.value, (draft) => fn(draft, t, ...args));
          t.next(nextValue);
        } catch (err) {
          p.error(err);
        }
      },
    );
  }

  get $isInAction() {
    const action = this.$_pending.value.find(({ type }) => type === EVENT_TYPE_ACTION);
    if (action) {
      return true;
    }
    if (this.$parent) {
      return this.$parent.$isInAction;
    }
    return false;
  }

  get $_actions() {
    return lazy(this, '$__actions', () => new Map());
  }

  $keyFor(fieldName) {
    if (!this.$isContainer) {
      return null;
    }
    if (!isStr(fieldName)) {
      return null;
    }
    if (this.$has(fieldName)) {
      return fieldName;
    }
    const lowerCaseFieldName = fieldName.toLowerCase();
    let match = null;
    const test = (key) => {
      if (isStr(key) && key.toLowerCase() === lowerCaseFieldName) {
        match = key;
      }
    };
    if (this.$type === TYPE_MAP) {
      this.value.forEach(test);
    }
    if (this.$type === TYPE_OBJECT) {
      Object.keys(this.value)
        .forEach(test);
    }
    return match;
  }

  get $_doObj() {
    return lazy(this, '$__doObj', makeDoObj);
  }

  get $_doProxy() {
    return lazy(this, '$__doProxy', makeDoProxy);
  }

  get $do() {
    if (typeof Proxy === 'undefined') {
      return this.$_doObj;
    }
    return this.$_doProxy;
  }

  $addAction(name, fn) {
    if (this.$_actions.has(name)) {
      console.warn('overwriting existing action in mirror', this);
    }
    console.log('adding action:', name);
    this.$_actions.set(name, fn);
  }

  $mutate(fn, ...args) {
    if (!isFn(fn)) {
      throw e('$mutate passed non-function', { fn });
    }

    return this.$event(EVENT_TYPE_MUTATE, {
      fn,
      args,
    });
  }

  $action(name, args) {
    const event = this.$event(EVENT_TYPE_ACTION, {
      name,
      args,
    });
    if (event.hasError && event.$trans) {
      this.$revertTrans(event.$trans);
      throw event.thrownError;
    }
    return event;
  }

  $set(name, value) {
    if (!this.$isContainer) {
      throw e('cannot set non-container', {
        name,
        value,
        target: this,
      });
    }
    console.log('setting', name, value);

    if (this.$hasChild(name)) {
      this.$children.get(name)
        .next(value);
      return;
    }
    // containers can have values not managed by children.
    if (this.$type === TYPE_MAP) {
      this.$mutate((draft) => {
        draft.set(name, value);
      });
    }
    if (this.$type === TYPE_OBJECT) {
      this.$mutate((draft) => {
        draft[name] = value;
      });
    }
  }
};

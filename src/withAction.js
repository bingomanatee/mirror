import produce from 'immer';
import { e, isFn, isStr } from './utils';
import {
  EVENT_TYPE_ACTION,
  EVENT_TYPE_MUTATE,
  STAGE_FINAL,
  STAGE_INIT,
  STAGE_PERFORM,
  TRANS_TYPE_ACTION,
  TYPE_MAP,
  TYPE_OBJECT,
} from './constants';
import { lazy, makeDoObj, makeDoProxy } from './mirrorMisc';

export default (BaseClass) => class WithAction extends BaseClass {
  constructor(...init) {
    super(...init);

    this.$on(EVENT_TYPE_ACTION, ({
      name,
      args,
    }, p, t) => {
      p.$trans = t.$_addTrans({
        type: TRANS_TYPE_ACTION,
        name,
        args,
      });
    },
    STAGE_INIT);
    this.$on(EVENT_TYPE_ACTION, ({
      name,
      args,
    }, p, t) => {
      if (!t.$_actions.has(name)) {
        p.error(e(`no action named ${name}`));
      } else {
        try {
          t.$_actions.get(name)(t, ...args);
          t.$_upsertTrans(p.$trans, (draft) => {
            draft.complete();
          });
        } catch (err) {
          t.$_upsertTrans(p.$trans, (draft) => {
            draft.error();
          });
          p.error(err);
        }
      }
    },
    STAGE_PERFORM);

    this.$on(
      EVENT_TYPE_MUTATE,
      ({
        fn,
        args,
      }, p, t) => {
        try {
          const nextValue = produce(t.value, (draft) => fn(draft, t, ...args));
          p.next({
            fn,
            args,
            nextValue,
          });
        } catch (err) {
          p.error(err);
        }
      },
      STAGE_PERFORM,
    );

    this.$on(
      EVENT_TYPE_MUTATE,
      ({
        fn,
        args,
        nextValue,
      }, p, t) => {
        const nextEvent = t.next(nextValue);
        if (nextEvent && nextEvent.thrownError) {
          p.error(nextEvent.thrownError);
        } else {
          p.next({
            fn,
            args,
            nextValue,
            next: t.value,
          });
        }
      },
      STAGE_FINAL,
    );
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
};

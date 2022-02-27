import { BehaviorSubject } from 'rxjs';
import eventMixin from './eventMixin';
import actionMixin from './actionMixin';
import idGen from './idGen';
import {
  EVENT_TYPE_FLUSH_ACTIVE,
  EVENT_TYPE_DEBUG,
  EVENT_TYPE_NEXT,
  EVENT_TYPE_VALIDATE, TYPE_MAP, TYPE_OBJECT, TYPE_ARRAY, EVENT_TYPE_CLEAN, ABSENT,
} from './constants';
import {
  isObj, isFn, asImmer, isStr, e, produce, typeOfValue, toMap, amend, lGet, isThere,
} from './utils';
import propsMixin from './propsMixin';
import childMixin from './childMixin';
import cleanMixin from './cleanMixin';

export default class Mirror extends childMixin(cleanMixin(propsMixin(actionMixin(eventMixin(BehaviorSubject))))) {
  constructor(value, config = {}) {
    super(lGet(config, 'mutable') ? value : asImmer(value), config);
    this.$_config(config);
  }

  $_config(config) {
    if (!isObj(config)) {
      return;
    }

    const {
      test,
      name,
      debug = false,
      cleaners,
      mutable,
      assets,
    } = config;

    this.$_mutable = !!mutable;

    if (isFn(test)) {
      this.$addTest(test);
    }
    this.$name = isStr(name, true) ? name : idGen();
    this.$_debug = debug;

    if (isObj(cleaners)) {
      toMap(cleaners)
        .forEach((fn, cleanerField) => {
          if (!this.$hasChild(cleanerField)) {
            this.$addChild(cleanerField, this.$get(cleanerField), { cleaner: fn });
          } else {
            this.$children.get(cleanerField).$addCleaner(fn);
          }
        });
    }

    if (isObj(assets)) {
      this.$_assets = { ...assets };
    }
  }

  /**
   * Assets are any meatadata - libraries, constants, functions --
   * that are probably not immutable or part of state directly --
   * that the mirror needs to operate. Database connections, DOM nodes or other arbitrary resources.
   * Assets primarily exist to sidestep the rigid criteria of Immutable to provide
   * values a mirror can access, but that it doesn't need to trace state with.
   * @returns {Object}
   */
  get $assets() {
    if (!this.$_assets) {
      this.$_assets = {};
    }
    return this.$_assets;
  }

  $setAsset(name, value) {
    this.$assets[name] = value;
    return this;
  }

  $_hasAssets() {
    return isThere(this.$_assets);
  }

  $asset(name) {
    if (!this.$_hasAssets) return null;
    if (!(name in this.$assets)) {
      return null;
    }
    return this.$asset[name];
  }

  get $debug() {
    if (this.$_debug) {
      return true;
    }
    if (this.$parent) {
      return this.$parent.$debug;
    }
    return false;
  }

  // a debugging aid
  $note(msg, value = null) {
    if (this.$debug) {
      if (this.$debug > 1) {
        console.log('target: ', this.$name, msg, value);
      }
      this.$send(EVENT_TYPE_DEBUG, {
        msg,
        target: this.$name,
        value,
      });
    }
  }

  /**
   * merge a subset of changes into the state.
   * @param values
   * @param offset
   */
  $update(values, offset = 0) {
    const type = this.$type;
    const valueType = typeOfValue(values);

    if (valueType !== type) {
      throw e('Bad update:', {
        values,
        target: this,
        expectedType: type,
        valueType,
      });
    }

    if (![TYPE_MAP, TYPE_OBJECT, TYPE_ARRAY].includes(type)) {
      console.warn('bad type for update: ', {
        target: this,
        type,
      });
      return this.next(values);
    }

    if (this.$_mutable) {
      return this.next(amend(this.value, values));
    }

    try {
      const next = produce(this.value, (draft) => {
        switch (type) {
          case TYPE_MAP:
            values.forEach((keyValue, key) => {
              draft.set(key, keyValue);
            });
            break;

          case TYPE_OBJECT:
            Object.keys(values)
              .forEach((key) => {
                draft[key] = values[key];
              });
            break;

          case TYPE_ARRAY:
            values.forEach((item, index) => {
              draft[index + offset] = item;
            });
            break;
        }
      });
      return this.next(next);
    } catch (err) {
      return this.next(amend(this.value, values));
    }
  }

  next(value) {
    const sanEvent = this.$send(EVENT_TYPE_CLEAN, value);
    if (sanEvent.hasError) {
      throw e('cleaning error for next value', {
        target: this,
        value,
        error: sanEvent.thrownError,
      });
    }
    let change = sanEvent.value;
    const evt = this.$send(EVENT_TYPE_NEXT, change);
    if (this.$_hasChildren) {
      change = this.$_withChildValues(change);
    }
    if (this.$_hasSelectors) {
      change = this.$_withSelectors(change);
    }
    evt.value = change;
    this.$root.$send(EVENT_TYPE_VALIDATE, evt);
    this.$send(EVENT_TYPE_FLUSH_ACTIVE, evt, true);
    if (evt.hasError) {
      throw evt.thrownError;
    }
  }

  $addTest(handler) {
    /**
     * note - validate is a trigger to validate the mirror's current value;
     * if it is invalid, validate the changeEvent.
     * changeEvent may come from elsewhere
     * and its manifest may be relevant to a different target.
     *
     * On an error, invalidate the change event.
     */
    return this.$on(EVENT_TYPE_VALIDATE, (changeEvent, evt, tgt) => {
      if (!changeEvent.isStopped) {
        const value = tgt.getValue();

        let err = null;
        try {
          err = handler(value, tgt);
        } catch (er) {
          err = er;
        }

        if (err) {
          changeEvent.error({
            target: tgt.$name,
            error: err,
          });
        }
      }
    });
  }

  $next(value) {
    super.next(value);
  }

  getValue() {
    if (this.$lastChange) {
      return this.$_withChildValues(this.$lastChange.value);
    }

    return super.getValue();
  }
}

Object.assign(Mirror.prototype, eventMixin);

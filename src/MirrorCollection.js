import { map } from 'rxjs/operators';
import upperFirst from 'lodash/upperFirst';
import lowerFirst from 'lodash/lowerFirst';
import clone from 'lodash/clone';
import Mirror from './Mirror';
import {
  ACTION_CHANGE_KEYS, ACTION_CHILD_ERROR, ACTION_NEXT, identity, PHASE_POST, SKIP,
} from './constants';
import { asMap, asObject } from './utils';

function actionChildError(error, {
  child,
  key,
  root,
}) {
  return [
    ACTION_CHILD_ERROR,
    {
      error,
      child,
      key,
      root,
    },
  ];
}

/**
 *
 * @param record {MirrorCollection}
 */
function onUpdate(record) {
  record.$on(ACTION_CHANGE_KEYS, (evt) => {
    if (!evt) {
      console.warn('---- WTF? no event to ACK');
      return;
    }
    if (evt.thrownError) {
      console.warn('changeKeys --- already has error: ', evt.thrownError);
      return;
    }
    record.$changeKeys(evt.value);
  }, PHASE_POST);
}

/**
 * A dictionary of key/value pairs. Inside the class the value is stored as a map.
 * If the initial param is an object than this.value will also be expressed as an object.
 *
 * note - the inner storage mechanic is a map, regardless of whether the object is expressed
 * as an object or a map to subscribers.
 */
export default class MirrorCollection extends Mirror {
  /**
   *
   * @param value {any}
   * @param options {Object}
   * @param options.actions {Object} a POJO of actions - functions;
   * @param options.name {String} an identifier for the collection
   */
  constructor(value, options) {
    super(value, options);
    this._$isMap = (value instanceof Map);
    // @TODO: test for object
    this.$children = new Map();
    asMap(value).forEach((val, key) => {
      this.$addChild({ key, value: val });
    });

    onUpdate(this);
  }

  /**
   *
   * returns whether the underlying map has a key.
   * @param key
   * @returns {boolean}
   */
  $has(key) {
    if (this.isStopped) return false;
    if (this._$isMap) return this.value.has(key);
    return key in this.value;
  }

  /**
   * returns whether the $children map has a key;
   * @param key
   * @returns {boolean}
   */
  $hasChild(key) {
    return this.$children.has(key);
  }

  /**
   * This force-changes one or more keys; it is intended to be the end-result of higher level
   * actions/events like $set or next.
   *
   * @param changedKeyMap {Map} a set of elements to update
   * @return Event
   */
  $changeKeys(changedKeyMap) {
    const firstValue = clone(this.value);
    const updateMap = asMap(this.value);
    asMap(changedKeyMap).forEach((value, key) => {
      try {
        updateMap.set(key, value);
      } catch (err) {
        console.log('error with revision setting ', key, 'to', value, 'from', changedKeyMap, 'to', updateMap);
      }
    });

    if (!this._$isMap) {
      return this.$next(asObject(updateMap));
    }
    return this.$next(updateMap);
  }

  /**
   * initiates a change request.
   * @param value
   */
  next(value) {
    return this.$send(ACTION_CHANGE_KEYS, asMap(value));
  }

  /**
   * an unguarded pipe to the root next of Mirror
   * @param map
   */
  $next(val) {
    try {
      const t = this.$trans();
      const valMap = asMap(val);
      const next = new Map(valMap); // clone
      const nextChildren = new Map();

      valMap.forEach((keyVal, key) => {
        if (this.$hasChild(key)) {
          nextChildren.set(key, keyVal);
          this.$children.get(key).next(keyVal); //  should trigger a muffled update.
          next.delete(key);
        }
      });
      // if there are any un-child mapped properties, update them manually.
      // will be processed as a changeMap -- won't affect child values processed above.
      if (next.size) {
        super.next(this._$isMap ? next : asObject(next));
      }
      t.complete();
    } catch (err) {
      console.log('error in $next', err, 'from map', map);
    }
  }

  /**
   * returns the TRUE value of a variable; ignores transactional locks.
   * will reach out to a transactionally locked child to get its true current value.
   * @param key
   * @returns {undefined|*}
   */
  $get(key) {
    if (!this.$has(key)) {
      return undefined;
    }
    if (this.$hasChild(key)) {
      return this.$children.get(key).$value;
    }
    if (this._$isMap) {
      return this.value.get(key);
    }
    return this.value[key];
  }

  $set(key, val) {
    return this.$send(ACTION_CHANGE_KEYS, new Map([[key, val]]));
  }

  /**
   * return the map, interpreted into an object via proxy.
   * note, the host, not the host value, is used as the proxy root,
   * because that way the update changes to reflect the current value
   * @returns {Proxy<value>}
   */
  get object() {
    if (typeof Proxy === 'undefined') {
      return asObject(this.value);
    }
    if (!this._$$objectProxy) {
      this._$$objectProxy = new Proxy(this, {
        get(host, propertyKey) {
          if (host.$hasChild(propertyKey)) {
            return host.$children.get(propertyKey).value;
          }
          if (host.value.has(propertyKey)) {
            return host.value.get(propertyKey);
          }
          return undefined;
        },
      });
    }
    return this._$$objectProxy;
  }

  /**
   * note - parent updates are keyed to transactionally cloaked version of subscribe;
   * child changes during transactions are kept private until the transaction completes.
   *
   * @param key {scalar}
   * @param value {any}
   * @returns {Subscription | Event}
   */
  $addChild({ key, value }) {
    if (this.$has(key)) {
      return this.$set(key, value);
    }
    const mir = new Mirror(value);
    this.$children.set(key, mir);
    const self = this;
    return mir.$subscribe({
      next(val) {
        self.$send(ACTION_CHANGE_KEYS, new Map([[key, val]]));
      },
      error(err) {
        self.$send(...actionChildError(err, {
          child: mir,
          key,
          root: this,
        }));
      },
      complete() {
        if (self._$deleting !== key) {
          self.delete(key);
        }
      },
    });
  }

  /**
   * removes a keyed value from the collection --
   * and any child associated with that key is removed
   * and completed.
   *
   * Does nothing if the key is not present.
   *
   * @param key
   */
  $delete(key = SKIP) {
    if ((key === SKIP) || (!this.$has(key)) || this.isStopped) {
      return;
    }

    this._$deleting = key;
    const t = this.$trans();

    if (this.$hasChild(key)) {
      const child = this.$children.get(key);
      if (!child.isStopped) {
        child.complete();
      }
      this.$children.delete(key);
    }

    let value = this.getValue();
    if (this._$isMap) {
      value = new Map(value);
      value.delete(key);
    } else delete value[key];
    this.$send(ACTION_NEXT, value);

    delete this._$deleting;

    t.complete();
  }

  /**
   * MirrorCollection proxy with action and property accessors.
   *
   * @returns {MirrorCollection|*}
   */
  get $p() {
    if (!this._$p) {
      const self = this;
      this._$p = new Proxy(this, {
        get(target, key) {
          try {
            if (target.$has(key)) {
              return target._$isMap ? target.value.get(key) : target.value[key];
            }

            if (target._$$acts && target._$$acts.has(key)) {
              const def = target._$acts.get(key);
              if (def) return def.proxy;
            }

            console.warn('--- cannot proxy ', key, 'from', target);
            console.warn('returning raw value:', target[key]);
            // name is not a proxied value; directly refer to the target
            return target[key];
          } catch (err) {
            console.log('error getting', key);
            console.log('from', target);
            console.warn(err);
          }
          return undefined;
        },
        set(target, key, value) {
          return target.$set(key, value);
        },
      });
    }
    return this._$p;
  }

  /**
   * ------------ do ------------
   * includes automatic child setters;
   */

  get $do() {
    if (!this._$do) {
      this._$do = new Proxy(this, {
        get(target, key) {
          if (target.$hasAction(key)) {
            return target._$acts.get(key).proxy;
          }
          if (/^set/i.test(key)) return target._$trySet(key);
          console.warn('$do-- cannot find action', key);
          return null; // should throw, wrist-slapping the programmer to write better code
        },
      });
    }
    return this._$do;
  }

  _$trySet(key) {
    const self = this;
    try {
      const targetName = lowerFirst(`${key}`.replace(/^set/i, ''));
      if (this.$has(targetName)) {
        return (value) => this.$set(targetName, value);
      }

      // forgiving attempt for case variation
      const lower = targetName.toLowerCase();
      const childFn = [...this.$children.keys(), ...asMap(this.value).keys()].reduce((fn, childKey) => {
        if (fn) return fn;
        const childLower = `${childKey}`.toLowerCase();

        if (childLower === lower) {
          console.warn(`found key, wrong case: ${key} should be "set${upperFirst(`${childKey}`)}".`);
          return (value) => self.$set(childKey, value);
        }
      }, null);

      if (childFn) {
        return childFn;
      }
      console.warn('trySet -- cannot match value ', lower);
    } catch (err) {
      console.warn('error trySetting key', key, ':', err);
    }
    return identity;
  }
}

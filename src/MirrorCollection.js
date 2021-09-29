/* eslint-disable camelcase */

import upperFirst from 'lodash/upperFirst';
import lowerFirst from 'lodash/lowerFirst';
import flattenDeep from 'lodash/flattenDeep';

import lEq from 'lodash/isEqual';

import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import Mirror from './Mirror';
import {
  ACTION_CHANGE_KEYS, ACTION_CHILD_ERROR, ACTION_NEXT, identity, PHASE_INIT, PHASE_POST, SKIP,
} from './constants';
import { asMap, asObject, isObject } from './utils';

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
    if (evt.isStopped || evt.thrownError) {
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
   * @param options.name {String} an identifier for the collection;
   * @param options.collections {Object} children who should be mapped to a MirrorCollection
   */
  constructor(value, options = {}) {
    super(value, options);
    this._$isMap = (value instanceof Map);
    // @TODO: test for object
    this.$children = new Map();
    this._$collectionOptions(options);
    onUpdate(this);
  }

  _$collectionOptions(options) {
    if (!isObject(options)) {
      return;
    }
    const { children = {}, collections = {} } = options;

    asMap(children)
      .forEach((val, key) => {
        this.$addChild({
          key,
          value: val,
        });
      });

    Object.keys(collections).forEach((key) => {
      this.$addChild({ key, value: collections[key], type: 'collection' });
    });
  }

  /**
   *
   * returns whether the underlying map has a key.
   * @param key
   * @returns {boolean}
   */
  $has(key) {
    if (this.isStopped) return false;
    if (this.$hasChild(key)) return true;
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
    if (this.isStopped) return null;
    const updateMap = asMap(this.value, true);
    asMap(changedKeyMap)
      .forEach((value, key) => {
        try {
          updateMap.set(key, value);
        } catch (err) {
          console.log('error with revision setting ', key, 'to', value, 'from', changedKeyMap, 'to', updateMap);
        }
      });

    return this.$next(this._$convert(updateMap));
  }

  /**
   * initiates a change request.
   * @param value
   */
  next(value) {
    return this.$send(ACTION_CHANGE_KEYS, asMap(value));
  }

  /**
   * convert a value set to the collections' type
   * @param value
   * @param force
   * @returns {*|{}|Map<K, V>|Map|Map<any, any>}
   */
  // eslint-disable-next-line camelcase
  _$convert(value, force) {
    if (this._$isMap) {
      return asMap(value, force);
    }
    return asObject(value, force);
  }

  get _$updatingChildren() {
    if (!this.__$updatingChildren) {
      this.__$updatingChildren = new Set();
    }

    return this.__$updatingChildren;
  }

  /**
   * returns number of procesdses that are updating a given child.
   * @param key
   * @returns {number}
   */
  $isUpdatingChild(key) {
    let count = 0;
    this._$updatingChildren.forEach((subject) => {
      if (!subject.isStopped && subject.value === key) {
        count += 1;
      }
    });
    return count;
  }

  _$unUpdateChild(subject) {
    if (!subject.isStopped) {
      subject.complete();
    }
    this._$updatingChildren.delete(subject);
  }

  /**
   * reutrns a subject that blocks child update messaging until it is complete.
   * subject has a $count of the _other_ subjects for that key that existed
   * before it was created;
   * @param key {string}
   * @returns {BehaviorSubject<*>}
   */
  $updateChildSubject(key) {
    const updateSubject = new BehaviorSubject(key);
    updateSubject.$count = this.$isUpdatingChild(key);

    this._$updatingChildren.add(updateSubject);
    const self = this;
    updateSubject.subscribe({
      complete() {
        self._$unUpdateChild(updateSubject);
      },
      error() {
        self._$unUpdateChild(updateSubject);
      },
    });
    return updateSubject;
  }

  /**
   * send an update request to a child;
   * @param key {*} the name of the child
   * @param value {*} the new child value
   * @returns {*}  the child's current value;
   */
  $updateChild(key, value) {
    if (!this.$hasChild(key)) return value;
    const child = this.$children.get(key);
    if (this.$isUpdatingChild(key)) return child.value;

    if (!lEq(child.value, value)) {
      const subject = this.$updateChildSubject(key);
      try {
        child.next(value); //  should trigger a muffled update.
        subject.complete();
      } catch (err) {
        subject.error(err);
      }
    }
    return child.value;
  }

  /**
   * an unguarded pipe to the root next of Mirror
   * @param val {Object | Map}
   */
  $next(val) {
    if (this.isStopped) {
      console.log('attempt to send value ', val, 'to stopped mirror', this.name);
      return;
    }
    this.$transact(() => {
      const valMap = asMap(val);
      const next = new Map(valMap); // clone

      valMap.forEach((keyVal, key) => {
        if (this.$hasChild(key)) {
          if (this.$isUpdatingChild(key)) {
            if (this.$debug) console.log('not calling updateChild: is updating ', keyVal);
          } else next.set(key, this.$updateChild(key, keyVal));
        }
      });
      // if there are any un-child mapped properties, update them manually.
      // will be processed as a changeMap -- won't affect child values processed above.
      if (next.size) {
        super.next(this._$convert(next));
      }
    });
  }

  $watch(...args) {
    const keys = flattenDeep(args);
    if (!this._$watchers) this._$watchers = new Map();
    const keySet = new Set(keys);
    const watching = Array.from(this._$watchers.keys());

    for (let wIndex = 0; wIndex < watching.length; ++wIndex) {
      const wsKey = watching[wIndex];
      if (lEq(wsKey, keySet)) {
        return this._$watchers.get(wsKey);
      }
    }

    const subject = this;
    const watchingKeys = this.pipe(
      map((value) => {
        const out = asMap(value, true);
        Array.from(out.keys()).forEach((key) => {
          if (!keys.includes(key)) out.delete(key);
        });
        return out;
      }),
      distinctUntilChanged((itemA, itemB) => {
        for (let i = 0; i < keys.length; ++i) {
          if (itemA.has(keys[i]) !== itemB.has(keys[i])) return false;
          if (itemA.has(keys[i]) && !lEq(itemA.get(keys[i]), itemB.get(keys[i]))) {
            return false;
          }
        }
        return true;
      }),
      map((value) => subject._$convert(value)),
    );

    const sub = this.subscribe({
      error() {
        subject._$watchers.delete(keySet);
      },
      complete() {
        subject._$watchers.delete(keySet);
      },
    });
    watchingKeys.subscribe({
      complete() {
        subject._$watchers.delete(keySet);
        sub.unsubscribe();
      },
      error() {
        subject._$watchers.delete(keySet);
        sub.unsubscribe();
      },
    });

    this._$watchers.set(keySet, watchingKeys);
    return watchingKeys;
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
    if (this.$hasChild(key)) {
      return this.$children.get(key)
        .next(val);
    }
    return this.next(new Map([[key, val]]));
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
   *
   * @param key {scalar}
   * @param value {any}
   * @returns {Subscription | Event}
   */
  $addChild({
    key,
    value,
    type = 'value',
  }) {
    if (this.$has(key)) {
      this.$delete(key);
    }
    let mir;
    switch (type) {
      case 'collection':
        mir = new MirrorCollection(value, { name: key });
        break;

      default:
        mir = new Mirror(value, { name: key });
    }
    this.$children.set(key, mir);
    const self = this;
    mir.$subscribe({
      next(val) {
        if (!self.$isUpdatingChild(key)) {
          const subject = self.$updateChildSubject(key);
          try {
            self.next(new Map([[key, val]]));
            subject.complete();
          } catch (err) {
            subject.error(err);
          }
        }
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
    return mir;
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
    } else {
      delete value[key];
    }
    this.$send(ACTION_NEXT, value);

    delete this._$deleting;

    t.complete();
  }

  /**
   * MirrorCollection proxy with action and property accessors.
   *
   * @returns {Proxy}
   */
  get $p() {
    if (!this._$p) {
      // @TODO: non-proxy analog

      this._$p = new Proxy(this, {
        get(target, key) {
          if (key === '$base') return target;
          try {
            if (target.$has(key)) {
              return target.$get(key);
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
   * in Looking Glass Engine $do was a proxy for action calls;
   * its still useful in case of namespace overlap.
   * @returns {null|MirrorCollection|(function(*=): Event)|*|(function(*): *)}
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

  /**
   * returns a setter function based on a key
   * @param key
   * @returns {(function(*): *)|*|(function(*=): Event)}
   * @private
   */
  _$trySet(key) {
    const self = this;
    try {
      const targetName = lowerFirst(`${key}`.replace(/^set/i, ''));
      if (this.$has(targetName)) {
        return (value) => this.$set(targetName, value);
      }

      // forgiving attempt for case variation
      const lower = targetName.toLowerCase();
      const childFn = [...this.$children.keys(), ...asMap(this.value)
        .keys()].reduce((fn, childKey) => {
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

  /**
   * in Looking Glass Engine `stream.my` was the recommended read-only way to get a keyed value
   * regardless of whether the target was an object or a map; proxy does this (and more) so
   * $my is provided for backwards compatibility with LGE.
   *
   * It still may be useful in case of namespace overlap between methods and properties
   * @returns {MirrorCollection|*}
   */
  get $my() {
    return this.$p;
  }

  get my() {
    console.warn('my is deprecated; use $my or $p');
    return this.$p;
  }

  $onFieldChange(fn, field) {
    this.$on(ACTION_CHANGE_KEYS, (evt) => {
      if (evt.value.has(field)) {
        const mappedValue = evt.value.get(field);
        const newValue = fn(mappedValue, evt);
        if (!lEq(newValue, mappedValue)) {
          const newMap = new Map(evt.value);
          newMap.set(field, newValue);
          evt.next(newValue);
        }
      }
    }, PHASE_INIT);
  }
}

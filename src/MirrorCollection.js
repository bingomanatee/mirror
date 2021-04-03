import { map } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import Mirror from './Mirror';
import {
  ACTION_CHANGE_KEYS, ACTION_CHILD_ERROR, ACTION_NEXT, PHASE_POST, SKIP,
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
    const nextEvent = record.$changeKeys(evt.value);
    // we cascade the nextEvent errors into the triggering changekeys event
    if (nextEvent.thrownError) {
      evt.error(nextEvent.thrownError);
    }
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
  constructor(value) {
    super(value);
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
    const updateMap = asMap(this.value);
    asMap(changedKeyMap).forEach((value, key) => updateMap.set(key, value));

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
  $next(map) {
    super.next(map);
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
    if ((key === SKIP) || (!this.$has(key))) {
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

    if (this.$has(key)) {
      const value = this.getValue();
      value.delete(key);
      this.$send(ACTION_NEXT, value);
    }

    delete this._$deleting;

    t.complete();
  }
}

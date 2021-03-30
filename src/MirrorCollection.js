import Mirror from './Mirror';
import {
  ACTION_CHANGE_KEYS, ACTION_CHILD_ERROR,
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
    evt.subscribe({
      complete() {
        record.$changeKeys(evt.value);
      },
      error(err) {
        record.$send(...actionChildError(err, record));
      },
    });
  });
}

/**
 * A dictionary of key/value pairs. Inside the class the value is stored as a map.
 * If the initial parmeter is an object than this.value will also be expressed as an object.
 */
export default class MirrorCollection extends Mirror {
  constructor(value) {
    const map = asMap(value);
    super(map);
    this._$isMap = (map instanceof Map);
    // @TODO: test for object
    this.$children = new Map();
    map.forEach((val, key) => {
      this.$addChild({ key, value: val });
    });

    onUpdate(this);
  }

  /**
   *
   * @param key
   * @returns {boolean}
   */
  $has(key) {
    return this.$children.has(key);
  }

  /**
   * This force-changes one or more keys; it is intended to be the end-result of higher level
   * actions/events like $set or next.
   *
   * @param changedKeyMap {Map | Object} a set of elements to update
   * @return Event
   */
  $changeKeys(changedKeyMap) {
    const updateMap = new Map(this.value);
    asMap(changedKeyMap).forEach((value, key) => updateMap.set(key, value));
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
          const val = host.getValue();
          return val.get(propertyKey);
        },
      });
    }
    return this._$$objectProxy;
  }

  get value() {
    if (this._$isMap) return this.getValue();
    return this.object;
  }

  $addChild({ key, value }) {
    if (this.$has(key)) {
      return this.$set(key, value);
    }
    const mir = new Mirror(value);
    this.$children.set(key, mir);
    const target = this;
    return mir.subscribe({
      next(val) {
        target.$send(ACTION_CHANGE_KEYS, new Map([[key, val]]));
      },
      error(err) {
        target.$send(...actionChildError(err, {
          child: mir,
          key,
          root: this,
        }));
      },
      complete() {
        // ???
      },
    });
  }
}

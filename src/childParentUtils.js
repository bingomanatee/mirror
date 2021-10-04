import { BehaviorSubject } from 'rxjs';
import { asMap, e } from './utils';
import {
  ABSENT, TYPE_MAP, TYPE_OBJECT, TYPE_VALUE,
} from './constants';
import { hasOrIs } from './mirrorMisc';


export function setParent(newParent, target, Mirror) {
  if (!newParent) {
    // eslint-disable-next-line no-param-reassign
    target.$_parent = null;
    return;
  }
  if (!(newParent instanceof Mirror)) {
    throw e('cannot parent a Mirror to a non-mirror', {
      newParent,
      target,
    });
  }
  // @TODO -- unparent current?
  // eslint-disable-next-line no-param-reassign
  target.$_parent = newParent;
}

export function mirrorHas(field, target) {
  if (target.$isValue && target.$_constructed) {
    throw e('cannot use $has on TYPE_VALUE MIRROR', {
      field,
      target,
    });
  }
  if (!target.$_children) return false; // prevent autogeneration of lazy collection
  return target.$children.has(field);
}

/**
 * returns true if:
 *
 * 1) value is absent and key is a valid child
 * 2) value is present and is (the mirror that)  is stored in target.$children.get(key);
 * 3) value is present and is the VALUE OF THE MIRROR that is stored in target.$children.get(key);
 *
 * @param key {any}
 * @param value {any|Mirror}
 * @param target {Mirror}
 * @returns {boolean}
 */
export function hasChild(key, value, target) {
  const has = mirrorHas(key, target);
  if (!has) {
    return false;
  }

  if (value === ABSENT) return true;
  // don't care what the child's value is -- just that the key is a valid child key

  const child = target.$children.get(key);
  return hasOrIs(child, value);
}

/**
 * seed child mirrors with the value of an injected value -- OR the current
 * target's value. Can be used to "reset" globally a target to a known state.
 *
 * @param value
 * @param target
 * @param returnNewFields {boolean}
 * @returns {Map<*, V>|Map<any, any>}
 */
export function updateChildren(value = ABSENT, target, returnNewFields = false) {
  if (target.$isValue) {
    throw new Error('do not call $updateChildren on a TYPE_VALUE; use next instead');
  }
  if (value === ABSENT) {
    if (value !== target.value) {
      updateChildren(target.value, target);
    }
    return new Map();
  }

  const badFields = [];
  const map = asMap(value);
  map.forEach((keyValue, newKey) => {
    if (!target.$has(newKey)) badFields.push(newKey);
  });

  if (badFields.length) {
    if (!returnNewFields) {
      throw e('invalid $updateChildren - unknown fields; use $addChildren on new fields', {
        badFields,
        target,
      });
    }
  }

  map.forEach((keyValue, key) => {
    target.$children.get(key)
      .next(keyValue);
  });

  return new Map(badFields.map((f) => [f, map.get(f)]));
}

/**
 * removes a child by key OR identity
 * @param nameOrMirror
 * @param target
 * @param Mirror
 * @returns {*}
 */
export function removeChild(nameOrMirror, target, Mirror) {
  if (nameOrMirror instanceof Mirror) {
    let key = ABSENT;
    target.$children.forEach((child, childKey) => {
      if (child === nameOrMirror) {
        key = childKey;
      }
    });
    if (key === ABSENT) {
      target.$_log('trying to remove child and its currently registered', { name: nameOrMirror });
      return;
    }
    return removeChild(key, target, Mirror);
  }


  if (target.$_lockFields) {
    target.$_log(2, 'attempt to remove child of a field-locked mirror', { name: nameOrMirror });
  }
  if (!target.$has(nameOrMirror)) {
    target.$_log(0, 'cannot find child ', nameOrMirror, 'to remove from ', target);
    return;
  }
  const child = target.$children.get(nameOrMirror);
  let sub = target.$_childSubs.get(nameOrMirror);
  if (!sub) sub = target.$_childSubs.get(child);
  if (!sub) return;

  sub.unsubscribe();
  target.$_childSubs.delete(nameOrMirror);
  target.$_childSubs.delete(child);
}

export function addChild(name = ABSENT, value = ABSENT, target, Mirror) {
  if ((name === ABSENT) || (value === ABSENT)) {
    console.log('addChild -- no name, value', name, value);
    return;
  }
  switch (target.$type) {
    case TYPE_MAP:
      if (target.$hasChild(name, value)) {
        return;
      }
      // any keys are acceptable
      break;

    case TYPE_VALUE:
      throw e('cannot add children to a value Mirror', {
        target,
        name,
        value,
      });
      // eslint-disable-next-line no-unreachable
      break;

    case TYPE_OBJECT:
      if (target.$hasChild(name, value)) {
        return;
      }
      switch (typeof (name)) {
        case 'string':
          if (name === '') {
            throw new Error('cannot accept "" as a child key for a TYPE_OBJECT');
          }
          break;

        case 'number':
          // all numbers acceptable but wonky
          // eslint-disable-next-line no-param-reassign
          value = `${value}`;
          break;

        default:
          target.$_log('only strings, numbers acceptable as TYPE_OBJECT child keys');
          return;
      }
      break;
    default:
      target.$_log(3, 'bad typed mirror');
      return;
  }

  if (!(value instanceof BehaviorSubject)) {
    // eslint-disable-next-line no-param-reassign
    value = new Mirror(value);
  }
  // @TODO: prevent/warn renaming after constructor?
  target.$children.set(name, value); // @TODO: use an add event
  if (value instanceof Mirror) {
    value.$_setName(name);
    value.$setParent(target);
  }

  const sub = value.subscribe({
    next(newValue) {
      target.$_updateField(name, newValue);
    },
    error(err) {
      target.$_log('error in child observer', {
        err,
      });
    },
    complete() {
      // ??
    },
  });

  target.$_childSubs.set(value, sub);
  target.$_childSubs.set(name, sub);
}

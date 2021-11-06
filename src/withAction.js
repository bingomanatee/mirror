import { isStr } from './utils';
import { TYPE_MAP, TYPE_OBJECT } from './constants';
import { lazy, makeDoObj, makeDoProxy } from './mirrorMisc';

export default (BaseClass) => class WithAction extends BaseClass {
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
};

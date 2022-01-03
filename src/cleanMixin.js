import {
  EVENT_TYPE_SET, TYPE_ARRAY, TYPE_MAP, TYPE_OBJECT,
} from './constants';
import {
  toMap, isObj, isWhole, produce, typeOfValue, isFn, isStr,
} from './utils';

export default (BaseClass) => class WithSanitize extends BaseClass {
  constructor(val, config, ...args) {
    super(val, config, ...args);

    this.$configSanitizers(config);

    if (this.$_hasSanitizers) {
      this.next(this.value);
    }
  }

  $addSanitizer(handler) {
    return this.$on(SANITIZE_VALUE, (evt, target) => {
      if (!evt.hasErrors) {
        try {
          evt.value = handler(evt.value);
        } catch (err) {
          evt.error(err);
        }
      }
    });
  }
};

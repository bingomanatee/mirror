import {
  EVENT_TYPE_CLEAN,
} from './constants';
import {
  isObj, isFn, e, toMap,
} from './utils';

export default (BaseClass) => class WithClean extends BaseClass {
  constructor(val, config, ...args) {
    super(val, config, ...args);

    this.$_configCleaner(config);
  }

  $_configCleaner(config) {
    if (!isObj(config)) return;
    const { cleaner } = config;
    if (cleaner) this.$addCleaner(cleaner);

    // note -- multiple clenaers added in core Mirror
  }

  $addCleaner(handler) {
    if (!isFn(handler)) throw e('cannot add handler: not a function', { handler });
    const sub = this.$on(EVENT_TYPE_CLEAN, (value, evt) => {
      if (!evt.hasErrors) {
        try {
          evt.value = handler(evt.value);
        } catch (err) {
          evt.error(err);
        }
      }
    });

    // validate that cleaner has not made current value impossible.
    const evt = this.$send(this.value);
    if (evt.hasError) {
      console.log('cannot add cleaner: ', handler, 'initial value is invalid');
      throw evt.thrownError;
    }

    return sub;
  }
};

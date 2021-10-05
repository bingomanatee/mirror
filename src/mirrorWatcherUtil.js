import { Subject } from 'rxjs';
import { isObject, present } from './utils';
import { ABSENT } from './constants';

export default function mirrorWatcher(mirror) {
  Object.defineProperty(mirror, '$$watcher', {
    configurable: false,
    enumerable: false,
    value: new Subject(),
  });

  let prior;
  Object.defineProperty(mirror, '$_prior', {
    get() { return prior; },
    set(p) {
      const prev = prior;
      prior = p;
      if (mirror.$$watcher) {
        mirror.$$say('(setting)', '$_prior', { to: prior, from: prev });
      }
    },
  });
  Object.defineProperty(mirror, '$$say', {
    value: (message, source, value = ABSENT) => {
      if (isObject(message)) {
        source = message.source;
        value = message.value;
        message = message.message;
      }

      mirror.$$watcher.next({
        message,
        source,
        value: present(value) ? value : message.value,
        mirrorValue: mirror.value,
        name: mirror.$name,
      });
    },
  });
}

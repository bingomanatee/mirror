import { Subject } from 'rxjs';

function reducePending(trans) {
  const {
    value, order, type,
  } = trans;
  if (value && typeof (value) === 'object' && ('order' in value)) {
    return {
      type,
      value: reducePending(value),
    };
  }
  return {
    type,
    value,
  };
}

export default (m) => {
  const queue = [];

  m.$_pending.subscribe((list) => queue.push({ pending: list.map(reducePending) }));
  m.subscribe((value) => queue.push({ currentValue: value }));
  const nativeEventQueue = m.$__eventQueue;

  // asserting immediate order -- ensuring that spy gets events first
  m.$__eventQueue = new Subject();
  m.$__eventQueue.subscribe((e) => queue.push(reducePending(e)));
  m.$__eventQueue.subscribe((e) => nativeEventQueue.next(e));

  return { queue };
};

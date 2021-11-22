import { Subject } from 'rxjs';

function reducePending(trans) {
  try {
    const {
      value, type,
    } = trans;
    let nextValue = typeof value === 'object' ? { ...value } : value;
    if (type === 'event:mutate' && typeof value === 'object') {
      nextValue = { ...value };
      delete nextValue.fn; // functions don't reduce to JSON - skip it
    }
    if (nextValue && typeof (nextValue) === 'object' && ('order' in nextValue)) {
      return {
        type,
        value: reducePending(nextValue),
      };
    }
    return {
      type,
      value: nextValue,
    };
  } catch (err) {
    console.log('-=- error in rp:', err, 'for', trans);
    return trans;
  }
}

export default (m) => {
  const queue = [];

  m.$_pending.subscribe((list) => {
    queue.push({ pending: list.map(reducePending) });
  });
  m.subscribe((value) => queue.push({ currentValue: value }));
  const nativeEventQueue = m.$__eventQueue;

  // asserting immediate order -- ensuring that spy gets events first
  m.$__eventQueue = new Subject();
  m.$__eventQueue.subscribe((e) => queue.push(reducePending(e)));
  m.$__eventQueue.subscribe((e) => nativeEventQueue.next(e));

  return { queue };
};

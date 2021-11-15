function reducePending(trans) {
  const { value, type } = trans;
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
  m.$_eventQueue.subscribe((e) => queue.push(reducePending(e)));

  return { queue };
};

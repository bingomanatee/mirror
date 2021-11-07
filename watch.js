module.exports = function watch(instance) {
  const history = [];
  const errors = [];
  const trans = [];
  const sub = instance.subscribe({
    next: history.push.bind(history),
    error: errors.push.bind(errors),
  });

  if (!instance.$_pending) {
    return [{ history, errors }, sub];
  }

  const transSub = instance.$_pending.subscribe((list) => trans.push(list));

  return [{ history, errors, trans }, sub, transSub];
};

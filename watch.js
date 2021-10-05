module.exports = function watch(instance) {
  const history = [];
  const errors = [];
  const sub = instance.subscribe({
    next: history.push.bind(history),
    error: errors.push.bind(errors),
  });

  return [{ history, errors }, sub];
};

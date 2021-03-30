const { map } = require('rxjs/operators');

module.exports = function watch(instance) {
  const history = [];
  const errors = [];
  const sub = instance.$events.pipe(map((e) => e.toJSON())).subscribe({
    next: history.push.bind(history),
    error: errors.push.bind(errors),
  });

  return [{ history, errors }, sub];
};

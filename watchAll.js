const { Subject } = require('rxjs');

/**
 * pushes events and values to history; includes history of children
 * @param instance {Mirror}
 * @param history {Array}
 * @returns {[{history: *[], errors: []}, Subscription | void | Unsubscribable | Promise<PushSubscription>]}
 */
module.exports = function watchAll(instance, history = []) {
  const errors = [];

  const name = instance.$name ? instance.$name : '';

  const sub = instance.subscribe({
    next: (value) => {
      history.push({
        name, value, r: 'NEXT',
      });
    },
    error: errors.push.bind(errors),
  });

  function ser(evt) {
    return {
      $type: evt.$type,
      value: evt.value,
      target: name,
      r: '$active.ITEM',
    };
  }

  const origEvents = instance.$events;

  instance.$_events = new Subject();

  instance.$_events.subscribe((evt) => origEvents.next(evt));

  instance.$events.subscribe((evt) => {
    const data = {
      target: name,
      event: evt.$type,
      value: evt.value,
      r: 'EVENT',
    };
    if (evt.thrownError) {
      data.ERROR = evt.thrownError;
    }
    history.push(data);
  });

  instance.$watchActive = (list) => {
    history.push({ name, active: list.map(ser) });
  };

  if (instance.$_hasChildren) {
    instance.$children.forEach((child) => {
      watchAll(child, history);
    });
  }

  return [{
    history,
    errors,
  }, sub];
};

import hyperid from 'hyperid';

const hyper = hyperid();

let queue = [];

export function enqueue(list) {
  list.forEach((item) => {
    if (Array.isArray(item)) {
      enqueue(item);
    } else {
      queue.push(item);
    }
  });
}

export function flushQueue() {
  queue = [];
}

export function id() {
  if (queue.length) {
    return queue.shift();
  }
  return hyper();
}

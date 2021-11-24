import hyperid from 'hyperid';

const hyper = hyperid();

// eslint-disable-next-line import/prefer-default-export
export function id() {
  return hyper();
}

import hyperid from 'hyperid';

const hyper = hyperid();

// eslint-disable-next-line import/prefer-default-export
export default function id() {
  return hyper();
}

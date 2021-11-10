import hyperid from 'hyperid';
import { immerable } from 'immer';
import { lGet } from './utils';
import {
  ABSENT, TRANS_TYPE_CHANGE,
} from './constants';

import { id } from './idGen';

let order = 0;
export default class MirrorTrans {
  constructor({
    name = ABSENT,
    type = TRANS_TYPE_CHANGE,
    value = ABSENT,
    errors = [],
  }) {
    this.name = name;
    this.type = type;
    this.value = value;
    this.errors = errors;
  }

  matches(compareTo) {
    return (lGet(compareTo, 'id', compareTo) === this.id);
  }

  before(otherTrans) {
    return this.order < otherTrans.order;
  }
}

MirrorTrans[immerable] = true;

MirrorTrans.make = (...args) => {
  const trans = new MirrorTrans(...args);
  trans.id = id();
  trans.order = order;
  order += 1;
  return trans;
};

import hyperid from 'hyperid';
import { immerable } from 'immer';
import { lGet } from './utils';
import {
  ABSENT, EVENT_TYPE_NEXT, TRANS_TYPE_CHANGE,
} from './constants';

import { id } from './idGen';

let order = 0;
export default class MirrorTrans {
  constructor({
    name = ABSENT,
    type = EVENT_TYPE_NEXT,
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

MirrorTrans.make = (mirror, ...args) => {
  const trans = new MirrorTrans(...args);
  trans.id = mirror.$transQueue ? mirror.$transQueue.shift() : id();
  trans.order = mirror.$root.$_transOrder;
  return trans;
};

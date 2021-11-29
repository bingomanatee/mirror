import hyperid from 'hyperid';
import { immerable } from 'immer';
import { isObj } from './utils';
import {
  ABSENT, EVENT_TYPE_NEXT, TRANS_TYPE_CHANGE,
} from './constants';

import { id } from './idGen';

const order = 0;
export default class MirrorTrans {
  constructor({
    name = ABSENT,
    type = EVENT_TYPE_NEXT,
    value = ABSENT,
    errors = [],
    committed = false,
  }) {
    this.name = name;
    this.type = type;
    this.value = value;
    this.errors = errors;
    if (committed) this.committed = true;
  }

  matches(compareTo) {
    if (compareTo === this.id) return true;
    if (isObj(compareTo)) return this.id === compareTo.id;
    return false;
  }

  before(otherTrans) {
    return this.order < otherTrans.order;
  }
}

MirrorTrans[immerable] = true;

MirrorTrans.make = (mirror, def) => {
  const trans = new MirrorTrans(def);
  trans.id = mirror.$transQueue ? mirror.$transQueue.shift() : id();
  trans.order = mirror.$root.$_transOrder;
  return trans;
};

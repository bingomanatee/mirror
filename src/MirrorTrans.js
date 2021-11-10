import hyperid from 'hyperid';
import { immerable } from 'immer';
import lGet from 'lodash/get';

import {
  ABSENT, TRANS_STATE_COMPLETE, TRANS_STATE_ERROR, TRANS_STATE_NEW, TRANS_TYPE_CHANGE,
} from './constants';

const hyper = hyperid();
let order = 0;
export default class MirrorTrans {
  constructor({
    type = TRANS_TYPE_CHANGE,
    value = ABSENT,
  }) {
    this.type = type;
    this.value = value;
    this.state = TRANS_STATE_NEW;
  }

  complete() {
    this.state = TRANS_STATE_COMPLETE;
  }

  error(err) {
    this.$error = err;
    this.state = TRANS_STATE_ERROR;
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
  trans.id = hyper();
  trans.order = order;
  order += 1;
  return trans;
};

import hyperid from 'hyperid';
import { immerable } from 'immer';

import { ABSENT, TRANS_STATE_NEW, TRANS_TYPE_CHANGE } from './constants';

const hyper = hyperid();

export default class MirrorTrans {
  [immerable] = true;

  constructor({
    name = ABSENT,
    creator = ABSENT,
    parent = ABSENT,
    type = TRANS_TYPE_CHANGE,
    value = ABSENT,
  }) {
    this.id = hyper();
    this.name = name;
    this.sharded = false;
    this.validated = false;
    this.creator = creator;
    this.parent = parent;
    this.type = type;
    this.value = value;
    this.state = TRANS_STATE_NEW;
  }
}

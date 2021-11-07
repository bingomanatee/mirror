import { BehaviorSubject } from 'rxjs';

import {
  ABSENT, STAGE_ERROR, STAGE_FINAL, STAGE_INIT, STAGE_PERFORM, STAGE_POST, STAGE_VALIDATE,
} from './constants';

class MirrorEvent extends BehaviorSubject {
  constructor(value, type, target = ABSENT, stage = STAGE_INIT, err = ABSENT) {
    super(value);
    // todo: use $stagesFor to set initial target
    this.$target = target;
    this.$type = type;
    this.$_constructed = true;
    this.$stage = stage;
    this.$err = err;
    this.$trans = null;
  }

  getValue() {
    return this._value;
  }
}

export default MirrorEvent;

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
  }

  error(err) {
    if (!this.isStopped) {
      this.complete();
      this.$target.$_eventQueue.next(new MirrorEvent(this.value, this.$type, this.$target, STAGE_ERROR, err));
    }
  }
}

export default MirrorEvent;

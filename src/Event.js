import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { distinctUntilKeyChanged, map } from 'rxjs/operators';
import {
  ABSENT, STAGE_FINAL, STAGE_INIT, STAGE_PERFORM, STAGE_POST, STAGE_VALIDATE,
} from './constants';
import { isFn } from './utils';

class Event extends BehaviorSubject {
  constructor(value, type, target, ...args) {
    super(value);
    this.$type = type;
    this.$target = target;
    this.$args = args;
    this.$_constructed = true;
  }

  get $stageSubject() {
    const self = this;
    if (!this.$_stageSubject) {
      this.$_stageSubject = of(STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL);
      this.$_stageSubject.subscribe({
        next(stage) {
          self.$stage = stage;
        },
        error() {
        },
      });
    }
    return this.$_stageSubject;
  }

  get $stage() {
    return this.$_stage;
  }

  /**
   * returns a serial Observable that has the value of event projected across all the stages.
   * @returns {Observable<{stage: *, type: *, event: Event, value: *, target: *}>}
   */
  $perform() {
    const event = this;
    const stages = of(STAGE_INIT, STAGE_VALIDATE, STAGE_PERFORM, STAGE_POST, STAGE_FINAL);
    const subject = combineLatest(this, stages)
      .pipe(
        map(([value, stage]) => ({
          value,
          type: event.$type,
          target: event.$target,
          stage,
          event,
        })),
        distinctUntilKeyChanged('stage'),
      );
    return subject;
  }
}

Event.create = (...args) => new Event(...args).$perform;

export default Event;

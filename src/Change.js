import { BehaviorSubject } from 'rxjs';
import { compact, flattenDeep, uniq } from 'lodash';
import { ABSENT } from './constants';
import {
  isArray, isFunction, isObject, noop,
} from './utils';

console.log();

export class Action extends BehaviorSubject {
  constructor(fn, target) {
    super(compact(uniq(flattenDeep(fn))));
    this.$target = target;
    this.$result = null;
    const self = this;
    this.subscribe({
      next(out) {
        self.result = out;
      },
      error: noop,
      complete: noop,
    });
  }

  after(fn, nextTarget) {
    const nextAction = fn instanceof Action ? fn : new Action(fn, nextTarget || this.$target);
    const self = this;
    this.subscribe({
      error: (e) => nextAction.error(e),
      complete() {
        nextAction.perform(self);
      },
    });

    return nextAction();
  }

  perform(previous) {
    if (this.isStopped) return;

    const acts = [...this.value];
    const result = [];
    let prior = null;
    while (acts.length) {
      const item = acts.shift();
      if (item instanceof Action) {
        if (item.hasError) {
          this.error(item.thrownError);
          return;
        }
        prior = item.perform(previous, prior);
        if (item.hasError) {
          if (!this.isStopped) this.error(item.thrownError);
          return;
        }
        result.push(prior);
      } else if (isFunction(item)) {
        try {
          prior = item(this, prior, previous);
          result.push(prior);
        } catch (err) {
          if (!this.isStopped) this.error(err);
          return;
        }
      }
    }

    if (!this.isStopped) {
      this.$result = result;
      this.complete();
    }
  }

  performInstruction(inst) {
    const result = inst.perform();
    if (result) {
      this.error(result);
    }
  }
}

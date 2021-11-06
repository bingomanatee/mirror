import produce from 'immer';
import { BehaviorSubject, Subject } from 'rxjs';
import { ABSENT, TRANS_STATE_COMPLETE, TRANS_TYPE_CHANGE } from './constants';
import { e, isThere } from './utils';
import { lazy } from './mirrorMisc';
import MirrorTrans from './MirrorTrans';

export default (BaseClass) => (class WithTrans extends BaseClass {
  get $_pending() {
    return lazy(this, '$__pending', (target) => {
      const pending = new BehaviorSubject([]);
      pending.subscribe({
        next(list) {
          target.$_pendingUpdate(list);
        },
      });
      return pending;
    });
  }

  $_pendingUpdate(list = ABSENT) {
    if (!isThere(list)) list = this.$_pending.value;
    if (list.length && list.all((transaction) => transaction.state === TRANS_STATE_COMPLETE)) {
      this.$_flushTrans();
    }
  }

  $_flushTrans(list = ABSENT) {
    if (!isThere(list)) list = this.$_pending.value;
    const queue = [...list];
    let value = ABSENT;
    while ((!isThere(value)) && queue.length) {
      const trans = queue.pop();
      if (trans.type === TRANS_TYPE_CHANGE) {
        value = trans.value;
        break;
      }
    }
    if (isThere(value)) {
      super.next(value);
    }
    this.$_pending.next([]);
  }

  /**
   *
   * changeQueue accepts new queue events and upserts them into the pending list
   *
   * @returns {BehaviorSubject}
   */
  get $_changeQueue() {
    return lazy(this, '$_changeQueue', (target) => {
      const queue = new Subject();
      queue.subscribe({
        next(trans) {
          target.$_upsertToPending(trans);
        },
        error(err) {
          console.log('error  in changeQueue', err);
        },
      });
      return queue;
    });
  }

  $_upsertToPending(item) {
    if (this.$_pending.some((candidate) => candidate.id === item.id)) {
      const list = this.$_pending.map((candidate) => (candidate.id === item.id ? item : candidate));

      this.$_pending.next(produce(list, (draft) => draft));
    } else {
      this.$_pending.next(produce([...this.$_pending.value, item], (draft) => draft));
    }
  }

  /**
   * $_try needs to be updated -- its not really where it should be
   * @param value
   */
  $_try(value, parent = ABSENT) {
    if (this.isStopped) {
      throw e('cannot try value on stopped Mirror', {
        value,
        target: this,
      });
    }

    this.$_addToQueue({
      value,
      type: TRANS_TYPE_CHANGE,
      parent,
      sharded: !this.$isContainer,
    });
  }

  $_addToQueue(def) {
    if (this.isStopped) {
      throw e('cannot transact on stopped mirror', { trans: def });
    }
    const trans = produce(def, (draft) => new MirrorTrans(draft));
    this.$_changeQueue.next(trans);
  }

  $_updateTrans(matchTo, fn) {
    const matched = this.$_pending.value.find((trans) => trans.matches(matchTo));
    if (matched) {
      const nextTrans = produce(matched, fn);
      this.$_upsertToPending(nextTrans);
    }
  }
});

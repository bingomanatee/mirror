/* eslint-disable camelcase */
import produce from 'immer';
import { BehaviorSubject } from 'rxjs';
import uniq from 'lodash/uniq';
import {
  ABSENT, EVENT_TYPE_ACTION, EVENT_TYPE_COMMIT, EVENT_TYPE_FLUSH_AFTER,
  EVENT_TYPE_NEXT, EVENT_TYPE_REVERT,
  TRANS_STATE_COMPLETE,
  TRANS_TYPE_CHANGE,
} from './constants';
import { e, isThere } from './utils';
import { lazy } from './mirrorMisc';
import MirrorTrans from './MirrorTrans';

export default (BaseClass) => (class WithTrans extends BaseClass {
  constructor(...init) {
    super(...init);
    this.$on(EVENT_TYPE_REVERT, (id, event, target) => {
      target.$_removeTrans(id);
    });

    this.$on(EVENT_TYPE_COMMIT, (id, event, target) => {
      try {
        const trans = target.$_getTrans(id);
        if (trans.type === EVENT_TYPE_ACTION) {
          target.$_removeTrans(id);
        }

        if (target.$isInAction) {
          console.log('--- has $isInAction -- not flushing');
          return;
        }

        target.$event(EVENT_TYPE_FLUSH_AFTER, trans.order);
      } catch (err) {
        console.log('--- error in commit: ', err);
      }
    });

    this.$on(EVENT_TYPE_FLUSH_AFTER, (order, event, target) => {
      if (target.$isInAction) {
        return;
      }
      target.$children.forEach((child) => {
        child.$event(EVENT_TYPE_FLUSH_AFTER, order);
      });

      const pendingNext = target.$_pending.value.filter(
        (trans) => (trans.type === EVENT_TYPE_NEXT) && (trans.order >= order),
      );
      const last = pendingNext.pop();
      if (last) {
        target.$_commitTrans(last.id);
      }
    });
  }

  get $_pending() {
    return lazy(this, '$__pending', () => new BehaviorSubject([]));
  }

  $_upsertTrans(item) {
    let list = [...this.$_pending.value];
    if (list.some((candidate) => candidate.id === item.id)) {
      list = this.$_pending.value.map((candidate) => (candidate.id === item.id ? item : candidate));
    } else {
      list.push(item);
    }
    this.$_pending.next(produce(list, (draft) => draft));
  }

  /**
   * flushTrans checks if the transactions are all complete;
   * if they are, then the last value in the list is committed, and all the transactions
   * are removed from the $pending queue.
   * @param list
   */
  $_flushPendingIfDone(list) {
    if (!isThere(list)) {
      return this.$_flushPendingIfDone(this.$_pending.value);
    }
    if (list.length) {
      if (list.every((transaction) => transaction.state === TRANS_STATE_COMPLETE)) {
        if (this.$isContainer) {
          this.$children.forEach((child) => child.$_flushPendingIfDone());
        }
        this.$_commitTrans(list);
      }
    } else if (this.$isContainer) {
      // no transactions in this container, but there may be some in children
      // @TODO: might cause more than one update to root (this);
      // put under their own transaction? or poll then flush (or both)?
      // or, float shards into the parent class?
      this.$children.forEach((child) => child.$_flushPendingIfDone());
    }
    return this;
  }

  $commit(id) {
    this.$event(EVENT_TYPE_COMMIT, id);
  }

  $revert(id) {
    this.$event(EVENT_TYPE_REVERT, id);
  }

  /**
   * commits a transaction's value to the mirror.
   * @param id {String}
   */
  $_commitTrans(id) {
    const trans = this.$_getTrans(id);
    this.$_removeTrans(id);
    if (trans) {
      super.next(trans.value);
    }
    return this;
  }

  $_addTrans(def) {
    if (this.isStopped) {
      throw e('cannot transact on stopped mirror', { trans: def });
    }
    const mirror = this;
    const trans = produce(def, (draft) => MirrorTrans.make(mirror, draft));
    this.$_upsertTrans(trans);
    if (trans.type === TRANS_TYPE_CHANGE) {
      this.$_sendToChildren(trans.value);
    }
    return trans;
  }

  $_getTrans(id) {
    return this.$_pending.value.find((trans) => trans.matches(id));
  }

  $_addErrorsToTrans(matchTo, errors) {
    const uinqErrors = uniq(errors)
      .filter((e) => e);
    if (uinqErrors.length > 0) {
      console.log('--- errors found:', errors, 'for', matchTo);
      this.$_updateTrans(matchTo, (draft) => {
        draft.errors = uniq([...draft.errors, ...uinqErrors])
          .filter((e) => e);
      });
    }
  }

  /**
   * updates an existing transaction with a mutator function
   * @param matchTo {int|MirrorTrans} the original transaction (or its ID)
   * @param fn {function}
   * @returns {null|MirrorTrans}
   */
  $_updateTrans(matchTo, fn) {
    const matched = this.$_getTrans(matchTo);
    if (matched) {
      const nextTrans = produce(matched, fn);
      this.$_upsertTrans(nextTrans);
      return nextTrans;
    }
    console.log('cannot find match for ', matchTo, 'in', this.$_pending.value);

    return null;
  }

  $_removeTrans(id) {
    const trans = this.$_getTrans(id);
    const list = this.$_pending.value.filter((aTrans) => (aTrans.type !== EVENT_TYPE_NEXT) || aTrans.before(trans));
    this.$_pending.next(list);
  }

  $postEvent(event) {
    if (!event) {
      return;
    }
    if (event.hasError) {
      if (event.$trans) {
        this.$_removeTrans(event.$trans);
      }
      throw event.thrownError;
    }
    this.$_addTrans(event);
  }

  getValue() {
    const lastTrans = this.$_lastPendingTrans;
    return lastTrans ? lastTrans.value : super.getValue();
  }

  get $_lastPendingTrans() {
    const list = [...this.$_pending.value];
    return list.reverse()
      .reduce((last, trans) => {
        if (last) {
          return last;
        }
        if (trans.type === EVENT_TYPE_NEXT) {
          return trans;
        }
        return last;
      }, null);
  }
});

/* eslint-disable camelcase */
import produce from 'immer';
import { BehaviorSubject } from 'rxjs';
import {
  ABSENT,
  EVENT_TYPE_ACTION,
  EVENT_TYPE_NEXT, STAGE_ERROR,
  STAGE_INIT,
  STAGE_PERFORM, STAGE_POST,
  TRANS_STATE_COMPLETE, TRANS_STATE_ERROR,
  TRANS_TYPE_ACTION,
  TRANS_TYPE_CHANGE,
} from './constants';
import { e, isThere } from './utils';
import { lazy } from './mirrorMisc';
import MirrorTrans from './MirrorTrans';

export default (BaseClass) => (class WithTrans extends BaseClass {
  constructor(...init) {
    super(...init);

    this.$on(EVENT_TYPE_NEXT, (value, p, t) => {
      p.$trans = t.$_addTrans({
        value,
        type: TRANS_TYPE_CHANGE,
      });
    },
    STAGE_INIT);

    this.$on(EVENT_TYPE_NEXT, (value, p, t) => {
      if (p.$trans) {
        t.$revertTrans(p.$trans);
      }
    },
    STAGE_ERROR);

    this.$on(EVENT_TYPE_NEXT, (value, p, t) => {
      if (p.$trans) {
        t.$_updateTrans(p.$trans, (draft) => {
          draft.complete();
        }, t.$name === 'tvalidate' ? `completing trans for value ${JSON.stringify(value)}` : false);
        t.$_flushChildAfter()
        t.$_flushPendingIfDone();
      }
    },
    STAGE_POST);
  }

  get $_pending() {
    return lazy(this, '$__pending', () => {
      const pending = new BehaviorSubject([]);
      return pending;
    });
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

  /**
   * commits the most recent value changes;
   * and empties the $_pending queue of all entries.
   * Should only be done if all the transactions are complete -- eg, after a $_flushPendingIfDone
   * @param list
   */
  $_commitTrans(list = ABSENT) {
    if (!isThere(list)) {
      return this.$_commitTrans(this.$_pending.value);
    }
    const changes = list.filter((trans) => trans.type === TRANS_TYPE_CHANGE);
    const lastChange = changes.pop();
    if (lastChange && isThere(lastChange.value)) {
      super.next(lastChange.value);
    }
    this.$_pending.next([]);
    return this;
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
    this.$_trialValue = value;
    this.$_addTrans({
      value,
      type: TRANS_TYPE_CHANGE,
      parent,
      sharded: !this.$isContainer,
    });
  }

  $_addTrans(def) {
    if (this.isStopped) {
      throw e('cannot transact on stopped mirror', { trans: def });
    }
    const trans = produce(def, (draft) => MirrorTrans.make(draft));
    this.$_upsertTrans(trans);
    if (trans.type === TRANS_TYPE_CHANGE) {
      this.$_sendToChildren(trans.value);
    }
    return trans;
  }

  /**
   * updates an existing transaction with a mutator function
   * @param matchTo {int|MirrorTrans} the original transaction (or its ID)
   * @param fn {function}
   * @returns {null|MirrorTrans}
   */
  $_updateTrans(matchTo, fn) {
    const matched = this.$_pending.value.find((trans) => trans.matches(matchTo));
    if (matched) {
      const nextTrans = produce(matched, fn);
      this.$_upsertTrans(nextTrans);
      return nextTrans;
    }
    console.log('cannot find match for ', matchTo, 'in', this.$_pending.value);

    return null;
  }

  $_revertTrans(trans) {
    if (this.$isContainer) {
      this.$children.forEach((child) => child.$_revertTrans(trans));
    }
    const list = this.$_pending.value.filter((aTrans) => aTrans.before(trans));
    this.$_pending.next(list);
  }

  $postEvent(event) {
    if (!event) {
      return;
    }
    if (event.hasError) {
      if (event.$trans) {
        this.$revertTrans(event.$trans);
      }
      throw event.thrownError;
    }
  }
});

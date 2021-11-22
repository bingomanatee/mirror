/* eslint-disable camelcase */
import produce from 'immer';
import { BehaviorSubject } from 'rxjs';
import uniq from 'lodash/uniq';
import {
  ABSENT, EVENT_TYPE_ACTION, EVENT_TYPE_COMMIT, EVENT_TYPE_ACCEPT_AFTER,
  EVENT_TYPE_NEXT, EVENT_TYPE_REVERT,
  TRANS_STATE_COMPLETE,
  TRANS_TYPE_CHANGE, EVENT_TYPE_REMOVE_AFTER,
} from './constants';
import {
  e, isThere, sortBy, isEqual,
} from './utils';
import { lazy } from './mirrorMisc';
import MirrorTrans from './MirrorTrans';

export default (BaseClass) => (class WithTrans extends BaseClass {
  constructor(...init) {
    super(...init);
    this.$on(EVENT_TYPE_REVERT, (id, event, target) => {
      target.$_removeTrans(id);
    });

    this.$on(EVENT_TYPE_REMOVE_AFTER, (order, event, target) => {
      target.$children.forEach((child) => {
        child.$event(EVENT_TYPE_REMOVE_AFTER, order);
      });

      const remaining = target.$_pending.value.filter(
        (trans) => (trans.type === EVENT_TYPE_NEXT) && (trans.order < order),
      );
      if (remaining.length !== this.$_pending.value.length) {
        this.$_pending.next(remaining);
      }
    });

    this.$on(EVENT_TYPE_ACCEPT_AFTER, (trans, event, target) => {
      if (target.$isInAction) {
        return;
      }
      target.$children.forEach((child) => {
        child.$event(EVENT_TYPE_ACCEPT_AFTER, trans.order);
      });

      const pendingNext = target.$_pending.value.filter(
        (tr) => (tr.type === EVENT_TYPE_NEXT) && (tr.order >= trans.order),
      );

      if (pendingNext.length) {
        const last = pendingNext.pop();
        target.$_superNext(last.value);
      }
    });
  }

  get $_pending() {
    return lazy(this, '$__pending', (target) => {
      const subject = new BehaviorSubject([]);
      subject.subscribe((list) => {
        delete target.$_lastPendingTrans;
        for (let i = list.length - 1; i >= 0; i -= 1) {
          const trans = list[i];
          if (trans.type === EVENT_TYPE_NEXT) {
            target.$_lastPendingTrans = trans;
            break;
          }
        }
      });
      return subject;
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
   * evaluate $_pending to attempt to update the base Subject,
   * as long as there are no active actions.
   * Perconate leaf-down to ensure that child pending updates resolve first.
   */
  $commit() {
    if (this.$isInAction) {
      return;
    }
    if (this.$isContainer) {
      this.$children.forEach((child) => {
        child.$commit();
      });
    }
    if (this.$_pending.value.length) {
      const last = sortBy(this.$_pending.value, 'order').pop();
      this.$_pending.next([]);
      this.$_superNext(last.value);
    }
  }

  $revert(id) {
    this.$event(EVENT_TYPE_REVERT, id);
  }

  /**
   * commits a transaction's value to the mirror.
   * @param value {any}
   */
  $_superNext(value) {
    super.next(value);
    return this;
  }

  $_addTrans(def) {
    if (this.isStopped) {
      throw e('cannot transact on stopped mirror', { trans: def });
    }
    const mirror = this;
    const trans = def instanceof MirrorTrans ? def : produce(def, (draft) => MirrorTrans.make(mirror, draft));
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

    return null;
  }

  $_removeTrans(transOrId) {
    const current = this.$_pending.value;
    const list = current.filter((aTrans) => !aTrans.matches(transOrId));
    this.$_pending.next(list);
    return {
      current,
      list,
    };
  }

  getValue() {
    const lastTrans = this.$_lastPendingTrans;
    return lastTrans ? lastTrans.value : super.getValue();
  }

  get $_pendingActive() {
    return !!this.$_pending.value.length;
  }
});

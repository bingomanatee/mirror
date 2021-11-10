import tap from 'tap';
import _ from 'lodash';
import { map } from 'rxjs/operators';
import watch from '../../watch';

const p = require('../../package.json');

const subjectName = 'Mirror';
const lib = require('../../lib/index');

const {
  TYPE_VALUE,
  TYPE_OBJECT,
  STAGE_INIT,
  STAGE_VALIDATE,
  STAGE_PERFORM,
  STAGE_POST,
  STAGE_FINAL,
  STAGE_ERROR,
  TRANS_STATE_NEW,
  TRANS_STATE_COMPLETE,
  TRANS_STATE_ERROR,
  TRANS_TYPE_CHANGE,
  TRANS_TYPE_ACTION,
  utils,
  e,
} = lib;

const NNV = 'non-numeric value';

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {
    suiteTests.test('trans', (tr) => {
      tr.test('set', (trs) => {
        const m = new Subject({
          a: 1,
          b: 2,
        });
        const [{ trans }] = watch(m);
        trs.same(trans, [[]]);
        m.$do.setA(4);
        trs.same(trans.length, 4);
        const summary = trans.map((list) => list.map(({
          state,
          type,
          value,
        }) => ({
          state,
          type,
          value,
        })));
        trs.same(summary, [
          [],
          [{
            type: TRANS_TYPE_CHANGE,
            value: {
              a: 4,
              b: 2,
            },
            state: TRANS_STATE_NEW,
          }],
          [{
            type: TRANS_TYPE_CHANGE,
            value: {
              a: 4,
              b: 2,
            },
            state: TRANS_STATE_COMPLETE,
          }],
          []
        ]);
        trs.end();
      });

      tr.test('set with validator', (trs) => {
        const m = new Subject({
          a: 1,
          b: 2,
        }, {
          name: 'tvalidate',
          test({ a }) {
            console.log('testing a:', a);
            if (!utils.isNumber(a)) {
              throw utils.e('non-numeric value', { a });
            }
          },
        });
        const [{ trans }] = watch(m);
        m.$_eventQueue.subscribe((ev) => console.log('--- event', ev.$type, 'stage:', ev.$stage, 'value: ', ev.value, ev.hasError ? 'ERROR' : ''));
        m.$_pending.subscribe((pe) => console.log('--- pending;', JSON.stringify(pe)));
        m.subscribe((value) => console.log('--- next value: ', JSON.stringify(value)));
        trs.same(trans, [[]]);
        m.$do.setA(2);
        let thrown = null;
        try {
          m.$do.setA('four');
        } catch (err) {
          thrown = err;
        }
        trs.same(thrown.message, 'non-numeric value');

        //  trs.same(trans.length, 3);
        const summary = trans.map((list) => list.map(({
          state,
          type,
          value,
        }) => ({
          state,
          type,
          value,
        })));
        console.log('summary with errors: ', JSON.stringify(summary, true, 1));

        trs.same(m.value, { a: 2, b: 2 });
        trs.end();
      });
      tr.end();
    });

    suiteTests.end();
  });

  suite.end();
});

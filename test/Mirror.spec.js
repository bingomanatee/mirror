import tap from 'tap';
import _ from 'lodash';
import { map } from 'rxjs/operators';
import watch from '../watch';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

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
} = lib;

const NNV = 'non-numeric value';

function reducePending(trans) {
  const { value, type } = trans;
  if (utils.isObj(value) && ('order' in value)) {
    return {
      type,
      value: reducePending(value),
    };
  }
  return {
    type,
    value,
  };
}

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {
    suiteTests.test('constructor', (tConst) => {
      tConst.test('basic value, no config', (cBasic) => {
        const m = new Subject(1);
        cBasic.equal(m.value, 1);
        cBasic.same(m.$type, TYPE_VALUE);

        cBasic.end();
      });

      tConst.test('config: name', (cName) => {
        const m = new Subject(1, { name: 'Bob' });
        cName.same(m.$name, 'Bob');
        cName.end();
      });

      tConst.end();
    });

    suiteTests.test('next - trans', (tNext) => {
      const m = new Subject(4);
      const queue = [];

      m.$_pending.subscribe((list) => queue.push({ pending: list.map(reducePending) }));
      m.subscribe((value) => queue.push({ currentValue: value }));
      m.$_eventQueue.subscribe((e) => queue.push(reducePending(e)));

      m.next(5);

      tNext.same(m.value, 5);

      tNext.same(queue,
        [{ pending: [] },
          { currentValue: 4 },
          {
            pending: [{
              type: 'next',
              value: 5,
            }],
          },
          {
            type: 'next',
            value: 5,
          },
          {
            type: 'event:validate',
            value: {
              type: 'next',
              value: 5,
            },
          },
          { pending: [] },
          { currentValue: 5 },
          {
            type: 'event:commit',
            value: {
              type: 'next',
              value: 5,
            },
          }]);
      tNext.end();
    });

    suiteTests.test('next - trans with validator', (tNext) => {
      const m = new Subject(4, {
        test: (n) => {
          if (typeof n !== 'number') {
            return NNV;
          }
        },
      });
      const queue = [];

      m.$_pending.subscribe((list) => queue.push({ pending: list.map(reducePending) }));
      m.subscribe((value) => queue.push({ currentValue: value }));
      m.$_eventQueue.subscribe((e) => queue.push(reducePending(e)));

      m.next(5);
      let error = null;
      try {
        m.next('six');
      } catch (err) {
        console.log('thrown error from bad next:', err);
        error = err;
      }
      tNext.same(error, NNV);
      tNext.same(m.value, 5);

      m.next(10);

      console.log('queue:', JSON.stringify(queue));
      tNext.same(m.value, 10);
      tNext.same(queue,
        [{ pending: [] },
          { currentValue: 4 },
          {
            pending: [{
              type: 'next',
              value: 5,
            }],
          },
          {
            type: 'next',
            value: 5,
          },
          {
            type: 'event:validate',
            value: {
              type: 'next',
              value: 5,
            },
          },
          { pending: [] },
          { currentValue: 5 },
          {
            type: 'event:commit',
            value: {
              type: 'next',
              value: 5,
            },
          },
          {
            pending: [{
              type: 'next',
              value: 'six',
            }],
          },
          {
            type: 'next',
            value: 'six',
          },
          {
            pending: [{
              type: 'next',
              value: 'six',
            }],
          },
          {
            type: 'event:validate',
            value: {
              type: 'next',
              value: 'six',
            },
          },
          { pending: [] },
          {
            type: 'event:revert',
            value: {
              type: 'next',
              value: 'six',
            },
          },
          {
            pending: [{
              type: 'next',
              value: 10,
            }],
          },
          {
            type: 'next',
            value: 10,
          },
          {
            type: 'event:validate',
            value: {
              type: 'next',
              value: 10,
            },
          },
          { pending: [] },
          { currentValue: 10 },
          {
            type: 'event:commit',
            value: {
              type: 'next',
              value: 10,
            },
          }]);
      tNext.end();
    });

    suiteTests.end();
  });

  suite.end();
});

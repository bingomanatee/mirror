import tap from 'tap';
import _ from 'lodash';
import { map } from 'rxjs/operators';
import watch from '../watch';
import transWatch from '../transWatch';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const {
  TYPE_VALUE,
  utils,
  idGen,
} = lib;

const NNV = 'non-numeric value';

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
      const m = new Subject(4, { transQueue: 'abcdefghijklmnopqrstuvwxyz'.split('') });
      const { queue } = transWatch(m);

      m.next(5);

      tNext.same(m.value, 5);
      // console.log('queue:', JSON.stringify(queue));
      tNext.same(queue,
        [{ pending: [] }, { currentValue: 4 }, {
          type: 'next',
          value: 5,
        }, {
          pending: [{
            type: 'next',
            value: 5,
          }],
        }, {
          type: 'event:validate',
          value: 'a',
        }, {
          type: 'event:commit',
          value: 'a',
        }, {
          type: 'event:flushAfter',
          value: 0,
        }, { pending: [] }, { currentValue: 5 }]);
      tNext.end();
    });

    suiteTests.test('next - trans with validator', (tNext) => {
      const m = new Subject(4, {
        test: (n) => {
          if (typeof n !== 'number') {
            return NNV;
          }
        },
        transQueue: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      });
      const { queue } = transWatch(m);

      m.next(5);
      let error = null;
      try {
        m.next('six');
      } catch (err) {
        error = err;
      }
      tNext.same(error, [NNV]);
      tNext.same(m.value, 5);
      m.next(10);

      tNext.same(m.value, 10);
      // console.log('queue after 10', JSON.stringify(queue));
      tNext.same(queue,
        [{ pending: [] }, { currentValue: 4 }, {
          type: 'next',
          value: 5,
        }, {
          pending: [{
            type: 'next',
            value: 5,
          }],
        }, {
          type: 'event:validate',
          value: 'a',
        }, {
          type: 'event:commit',
          value: 'a',
        }, {
          type: 'event:flushAfter',
          value: 0,
        }, { pending: [] }, { currentValue: 5 }, {
          type: 'next',
          value: 'six',
        }, {
          pending: [{
            type: 'next',
            value: 'six',
          }],
        }, {
          type: 'event:validate',
          value: 'e',
        }, {
          pending: [{
            type: 'next',
            value: 'six',
          }],
        }, {
          type: 'event:revert',
          value: 'e',
        }, { pending: [] }, {
          type: 'next',
          value: 10,
        }, {
          pending: [{
            type: 'next',
            value: 10,
          }],
        }, {
          type: 'event:validate',
          value: 'h',
        }, {
          type: 'event:commit',
          value: 'h',
        }, {
          type: 'event:flushAfter',
          value: 7,
        }, { pending: [] }, { currentValue: 10 }]);
      tNext.end();
    });

    suiteTests.end();
  });

  suite.end();
});

import tap from 'tap';
import transWatch from '../transWatch';
import EXPECT_TRANS_WITH_VALIDATOR from './expect/mirror-spec-trans-with-validator.json';
import EXPECT_NEXT from './expect/mirror-spec-next.json';

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
  suite.test(`${subjectName} (Value type)`, (subjectTests) => {
    subjectTests.test('constructor', (tConst) => {
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

    subjectTests.test('next - trans', (tNext) => {
      const m = new Subject(4, { transQueue: 'abcdefghijklmnopqrstuvwxyz'.split('') });
      const { queue } = transWatch(m);

      m.next(5);

      tNext.same(m.value, 5);
      console.log('next queue:', JSON.stringify(queue));
      tNext.same(queue,
        EXPECT_NEXT);
      tNext.end();
    });

    subjectTests.test('next - trans with validator', (tNext) => {
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
      console.log('queue after 10', JSON.stringify(queue));
      tNext.same(queue,
        EXPECT_TRANS_WITH_VALIDATOR);
      tNext.end();
    });

    subjectTests.end();
  });

  suite.end();
});

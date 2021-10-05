import tap from 'tap';
import watch from '../watch';

const p = require('./../package.json');

const subjectName = 'Mirror';
const lib = require('./../lib/index');

const {
  TYPE_VALUE,
  utils,
  mirrorWatcher,
} = lib;

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {
    suiteTests.test('constructor', (tConst) => {
      tConst.test('basic value, no config', (cBasic) => {
        const m = new Subject(1);
        cBasic.equal(m.value, 1);
        cBasic.same(m.$type, TYPE_VALUE);

        m.next(2);
        cBasic.equal(m.value, 2);
        cBasic.end();
      });

      tConst.test('config: name', (cName) => {
        const m = new Subject(1, { name: 'Bob' });
        cName.same(m.$name, 'Bob');
        cName.end();
      });

      tConst.end();
    });

    suiteTests.test('test - observed', (tTest) => {
      const m = new Subject(1, {
        name: 'Testy',
        test: (v) => {
          if (!utils.isNumber(v)) throw new Error('non-numeric value');
        },
      });
      // mirrorWatcher(m);
      // m.$$watcher.subscribe((data) => {
      //   process.nextTick(() => {
      //     console.log(data.name, '--- observed ', data.source, ':', data.message, utils.present(data.value) ? data.value : '', '((value = ', data.mirrorValue, '))');
      //   });
      // });
      m.subscribe((v) => {
        process.nextTick(() => console.log('---- value emitted from ', m.$name, ':', v));
      });

      const [{
        history,
        errors,
      }] = watch(m);

      tTest.same(errors.length, 0);
      tTest.same(history, [1]);
      tTest.same(m.value, 1);

      m.next(2);
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);

      m.next('three');
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);

      m.next(4);
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2, 4]);

      m.complete();
      tTest.end();
    });

    suiteTests.end();
  });

  suite.end();
});

import tap from 'tap';

const p = require('./../../package.json');
const watch = require('./../../watch');

const subjectName = 'Mirror';
const lib = require('./../../lib/index');

const { TYPE_VALUE, utils, mirrorWatcher } = lib;

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

        m.complete();
        cBasic.end();
      });

      tConst.test('config: name', (cName) => {
        const m = new Subject(1, { name: 'Bob' });
        cName.same(m.$type, TYPE_VALUE);
        cName.same(m.$name, 'Bob');

        m.complete();
        cName.end();
      });

      tConst.test('config: forced type', (cType) => {
        const m = new Subject({ a: 1, b: 2 }, { type: TYPE_VALUE });
        cType.same(m.$type, TYPE_VALUE);
        m.complete();
        cType.end();
      });

      tConst.end();
    });

    suiteTests.test('next', (nTest) => {
      const m = new Subject(1, { name: 'Bob' });
      const [{ history, errors }] = watch(m);

      nTest.same(errors.length, 0);
      nTest.same(history, [1]);
      nTest.same(m.value, 1);

      m.next(2);
      nTest.same(m.value, 2);
      nTest.same(errors.length, 0);
      nTest.same(history, [1, 2]);

      m.complete();
      nTest.end();
    });

    suiteTests.test('test', (tTest) => {
      const m = new Subject(1, {
        name: 'Bob',
        test: (v) => {
          if (!utils.isNumber(v)) throw new Error('non-numeric value');
        },
      });

      const [{ history, errors }] = watch(m);

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
    suiteTests.test('test - observed', (tTest) => {
      const m = new Subject(1, {
        name: 'Bob',
        test: (v) => {
          if (!utils.isNumber(v)) throw new Error('non-numeric value');
        },
      });
      mirrorWatcher(m);
      m.$$watcher.subscribe((data) => { console.log('--- observed ', data.source, ':', data.message, data); });

      const [{ history, errors }] = watch(m);

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

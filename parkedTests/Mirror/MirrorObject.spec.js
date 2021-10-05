const tap = require('tap');
const watch = require('../../watch');
const p = require('./../../package.json');

const subjectName = 'Mirror';
const lib = require('./../../lib/index');

const { TYPE_OBJECT } = lib;

const XYZ = Object.freeze({ x: 1, y: 2, z: 3 });
const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Object type)`, (suiteTests) => {
    suiteTests.test('constructor', (tConst) => {
      tConst.test('basic value, no config', (cBasic) => {
        const m = new Subject(XYZ);
        cBasic.equal(m.$get('x'), 1);
        cBasic.equal(m.$get('y'), 2);
        cBasic.equal(m.$get('z'), 3);
        cBasic.same(m.$type, TYPE_OBJECT);

        m.complete();
        cBasic.end();
      });

      tConst.test('config: name', (cName) => {
        const m = new Subject(XYZ, { name: 'Bob' });
        cName.same(m.$name, 'Bob');
        m.complete();
        cName.end();
      });

      tConst.end();
    });

    suiteTests.test('parent/child', (pc) => {
      pc.test('sharding', (sh) => {
        const m = new Subject(XYZ);

        sh.same(m.$children.get('x').$parent, m);

        m.complete();
        sh.end();
      });

      pc.test('next', (nTest) => {
        const m = new Subject(XYZ);

        const [{ history, errors }] = watch(m);
        nTest.same(history.length, 1);
        nTest.same(errors.length, 0);

        m.next({ y: 4 });
        nTest.equal(m.$get('x'), 1);
        nTest.equal(m.$get('y'), 4);
        nTest.equal(m.$get('z'), 3);
        nTest.same(m.value, { x: 1, y: 4, z: 3 });

        m.next({ y: 5, x: 2 });
        nTest.equal(m.$get('x'), 2);
        nTest.equal(m.$get('y'), 5);
        nTest.equal(m.$get('z'), 3);

        nTest.same(m.value, { x: 2, y: 5, z: 3 });

        nTest.same(history.length, 4); // one for each child change; will ultimately be 3 for transactions
        nTest.same(errors.length, 0);
        m.complete();

        nTest.end();
      });

      pc.end();
    });

    suiteTests.end();
  });

  suite.end();
});

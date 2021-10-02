const tap = require('tap');
const watch = require('../watch');
const p = require('./../../package.json');

const subjectName = 'Mirror';
const lib = require('./../../lib/index');

const { TYPE_MAP } = lib;

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Map type)`, (suiteTests) => {
    suiteTests.test('constructor', (tConst) => {
      tConst.test('basic value, no config', (cBasic) => {
        const m = new Subject(new Map([
          ['x', 1],
          ['y', 2],
          ['z', 3],
        ]));
        cBasic.equal(m.$get('x'), 1);
        cBasic.equal(m.$get('y'), 2);
        cBasic.equal(m.$get('z'), 3);
        cBasic.same(m.$type, TYPE_MAP);

        m.complete();
        cBasic.end();
      });

      tConst.test('config: name', (cName) => {
        const m = new Subject(new Map([
          ['x', 1],
          ['y', 2],
          ['z', 3],
        ]), { name: 'Bob' });
        cName.same(m.$name, 'Bob');
        m.complete();
        cName.end();
      });

      tConst.end();
    });

    suiteTests.test('parent/child', (pc) => {
      pc.test('sharding', (sh) => {
        const m = new Subject(new Map([
          ['x', 1],
          ['y', 2],
          ['z', 3],
        ]));

        sh.same(m.$children.get('x').$parent, m);

        m.complete();
        sh.end();
      });

      pc.test('next', (nTest) => {
        const m = new Subject(new Map([
          ['x', 1],
          ['y', 2],
          ['z', 3],
        ]));

        const [{ history, errors }] = watch(m);
        nTest.same(history.length, 1);
        nTest.same(errors.length, 0);

        m.next({ y: 4 });
        nTest.equal(m.$get('x'), 1);
        nTest.equal(m.$get('y'), 4);
        nTest.equal(m.$get('z'), 3);
        m.complete();
        nTest.same(history.length, 2);
        nTest.same(errors.length, 0);

        nTest.end();
      });

      pc.end();
    });

    suiteTests.test('addChild', (ac) => {
      const m = new Subject(new Map([
        ['x', 1],
        ['y', 2],
        ['z', 3],
      ]));
      ac.same(m.$keys, new Set(['x', 'y', 'z']));
      ac.equal(m.$get('w'), undefined);
      ac.equal(m.$get('x'), 1);
      ac.equal(m.$get('y'), 2);
      ac.equal(m.$get('z'), 3);
      m.$addChild('w', 0);
      ac.equal(m.$get('w'), 0);
      ac.equal(m.$get('x'), 1);
      ac.equal(m.$get('y'), 2);
      ac.equal(m.$get('z'), 3);

      ac.end();
    });

    suiteTests.end();
  });

  suite.end();
});

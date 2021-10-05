const tap = require('tap');
const watch = require('../../watch');
const p = require('./../../package.json');

const subjectName = 'Mirror';
const lib = require('./../../lib/index');

const {
  TYPE_MAP,
  utils,
} = lib;

function isEven(n) {
  return utils.isNumber(n) && (!(n % 2));
}

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

        const [{
          history,
          errors,
        }] = watch(m);
        nTest.same(history.length, 1);
        nTest.same(errors.length, 0);

        m.next({ y: 4 });
        nTest.equal(m.$get('x'), 1);
        nTest.equal(m.$get('y'), 4);
        nTest.equal(m.$get('z'), 3);
        nTest.same(m.value, new Map([['x', 1], ['y', 4], ['z', 3]]));

        nTest.same(history.length, 2);
        nTest.same(errors.length, 0);

        m.next({
          y: 5,
          x: 2,
        });
        nTest.equal(m.$get('x'), 2);
        nTest.equal(m.$get('y'), 5);
        nTest.equal(m.$get('z'), 3);
        nTest.same(m.value, new Map([['x', 2], ['y', 5], ['z', 3]]));
        nTest.same(history.length, 4); // one for each child change; will ultimately be 3 for transactions
        nTest.same(errors.length, 0);
        m.complete();
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

    suiteTests.test('tests', (t) => {
      console.log('->>>>>>>>>> tests suite');
      const m = new Subject(new Map([
        ['x', 1],
        ['y', 2],
        ['z', 3],
      ]), {
        name: 'TM',
        test: (map) => {
          const x = map.get('x');
          console.log('testing x:', x);
          if (isEven(x)) throw new Error('x must be odd');
        },
      });

      const [{
        history,
        errors,
      }] = watch(m);
      t.same(history.length, 1);
      t.same(errors.length, 0);

      m.next({ y: 4 });
      t.equal(m.$get('x'), 1);
      t.equal(m.$get('y'), 4);
      t.equal(m.$get('z'), 3);
      t.same(m.value, new Map([['x', 1], ['y', 4], ['z', 3]]));

      t.same(history.length, 2);
      t.same(errors.length, 0);

      m.next({
        y: 5,
        x: 2,
      });
      t.equal(m.$get('x'), 2);
      t.equal(m.$get('y'), 5);
      t.equal(m.$get('z'), 3);
      t.same(m.value, new Map([['x', 2], ['y', 5], ['z', 3]]));
      t.same(history.length, 3); // one for each child change; will ultimately be 3 for transactions
      t.same(errors.length, 0);


      console.log('->>>>>>>>>> END tests suite');
      t.end();
    });

    suiteTests.end();
  });

  suite.end();
});

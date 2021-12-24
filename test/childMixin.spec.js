import tap from 'tap';
import watch from '../watch';
import watchAll from '../watchAll';

const { inspect } = require('util');
const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const Subject = lib[subjectName];

const NAN = 'not a number';

function testNum(value) {
  if (typeof value !== 'number') {
    return NAN;
  }
}

tap.test(p.name, (suite) => {
  suite.test(`${subjectName}/children`, (childTests) => {
    childTests.test('basic set', (bs) => {
      const m = new Subject({
        alphaField: 0, betaField: 0,
      }, {
        name: 'ROOT',
        debug: true,
        children: {
          alphaField: new Subject(0, { test: testNum }),
          betaField: new Subject(0, { test: testNum }),
        },
      });

      const [{ history }] = watch(m);

      const [{ history: allHistory }] = watchAll(m);

      m.next({ alphaField: 2, betaField: 4 });
      bs.same(m.value, { alphaField: 2, betaField: 4 });
      bs.same(m.$children.get('alphaField').value, 2);
      bs.same(history, [{ alphaField: 0, betaField: 0 }, { alphaField: 2, betaField: 4 }]);
      bs.same(m.$children.get('alphaField').$_active, []);
      bs.same(m.$children.get('betaField').$_active, []);

      let err = null;
      try {
        m.next({ alphaField: 'five', betaField: 6 });
      } catch (e) {
        err = e;
      }
      bs.same(err, { error: NAN, target: 'alphaField' });
      // console.log('--- basic set -- error:', inspect(allHistory, { depth: 5 }));
      bs.same(history, [{ alphaField: 0, betaField: 0 }, { alphaField: 2, betaField: 4 }]);
      bs.same(m.value.alphaField, 2);
      bs.same(m.value.betaField, 4);

      m.next({ alphaField: 10, betaField: 20 });
      bs.same(history, [{ alphaField: 0, betaField: 0 }, { alphaField: 2, betaField: 4 }, { alphaField: 10, betaField: 20 }]);
      bs.same(m.value.alphaField, 10);
      bs.same(m.value.betaField, 20);
      bs.end();
    });

    childTests.test('root updates when child changed', (cc) => {
      const m = new Subject({
        alphaField: 0, betaField: 0,
      }, {
        name: 'ROOT',
        debug: true,
        children: {
          alphaField: new Subject(0, { test: testNum }),
          betaField: new Subject(0, { test: testNum }),
        },
      });

      const [{ history }] = watch(m);

      const [{ history: allHistory }] = watchAll(m);

      m.$children.get('alphaField').next(20);

      cc.same(m.value.alphaField, 20);
      cc.end();
    });

    childTests.end();
  });

  suite.end();
});

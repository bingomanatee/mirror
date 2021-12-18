import tap from 'tap';
import watch from '../watch';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}/props`, (propsTests) => {
    propsTests.test('basic set', (bs) => {
      const m = new Subject({ a: 1, b: 2 });
      const [{ history }] = watch(m);

      m.$set('a', 4);

      bs.same(m.value, { a: 4, b: 2 });

      bs.same(history, [{ a: 1, b: 2 }, { a: 4, b: 2 }]);

      bs.end();
    });

    propsTests.test('selectors', (sel) => {
      sel.test('basic', (selB) => {
        const m = new Subject({ x: 1, y: 2 }, {
          name: 'point',
          selectors: {
            mag(value) {
              return Math.sqrt(value.x ** 2 + value.y ** 2);
            },
          },
        });

        selB.same(m.value.mag, Math.sqrt(5));

        m.$do.setX(10);

        selB.same(m.value.mag, Math.sqrt(104));

        selB.end();
      });

      sel.end();
    });

    propsTests.end();
  });

  suite.end();
});

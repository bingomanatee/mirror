import tap from 'tap';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

function simple(pending) {
  return pending.map(({ $type, value }) => ({
    $type,
    value,
  }));
}

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}/actions`, (actionTests) => {
    actionTests.test('basic flow', (bf) => {
      const values = [];
      const pend = [];
      const mir = new Subject(4, {
        actions: {
          double: (m) => {
            m.next(m.value * 2);
          },
        },
      });
      mir.subscribe((v) => values.push(v));

      mir.$watchActive = (pending) => {
        pend.push(simple(pending));
      };

      mir.$do.double();

      //  console.log('pending:', pend);

      bf.same(mir.value, 8);
      bf.same(values, [4, 8]);

      bf.end();
    });
    actionTests.test('multi update action', (bf) => {
      const values = [];
      const pend = [];
      const mir = new Subject({ x: 1, y: 2 }, {
        actions: {
          offset: (m, x, y) => {
            const value = { ...m.value };
            value.x += x;
            m.next(value);
            const value2 = { ...m.value };
            value2.y += y;
            m.next(value2);
          },
        },
      });
      mir.subscribe((v) => values.push(v));

      mir.$watchActive = (pending) => {
        pend.push(simple(pending));
      };

      mir.$do.offset(4, 10);

      //  console.log('pending:', pend);

      bf.same(mir.value, { x: 5, y: 12 });
      bf.same(values, [{ x: 1, y: 2 }, { x: 5, y: 12 }]);

      bf.end();
    });

    actionTests.end();
  });

  suite.end();
});

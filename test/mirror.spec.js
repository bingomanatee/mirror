import tap from 'tap';
import watch from '../watch';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}`, (mirTests) => {
    mirTests.test('next', (nxTests) => {
      const mir = new Subject(1);

      const values = [];
      mir.subscribe((value) => values.push(value));

      nxTests.same(values, [1]);

      mir.next(2);
      mir.next(3);

      nxTests.same(values, [1, 2, 3]);

      nxTests.end();
    });

    mirTests.test('with validation', (valTest) => {
      const mir = new Subject(1, {
        name: 'root',
        test: (val) => ((typeof val === 'number') ? null : 'not a number'),
      });

      const values = [];
      mir.subscribe((value) => values.push(value));

      mir.next(2);
      let thrown = null;
      try {
        mir.next('three');
      } catch (er) {
        thrown = er;
      }
      valTest.same(thrown, { target: 'root', error: 'not a number' });

      mir.next(4);

      valTest.same(values, [1, 2, 4]);

      valTest.end();
    });

    mirTests.test('readme', (mt) => {
      const numeric = new Subject(
        {
          number: 0,
          min: -5,
          max: 5,
        },
        {
          name: 'safe-number',
          test(next, mirror) {
            const { number } = next;
            if (typeof number !== 'number') return 'not a number';
            if (number > mirror.value.max) return `must be <= ${mirror.value.max}`;
            if (number < mirror.value.min) return `must be >= ${mirror.value.min}`;
          },
        },
      );

      numeric.$do.setNumber(4);
      mt.same(numeric.value.number, 4);
      let e = null;
      try {
        numeric.$do.setNumber(6);
      } catch (err) {
        e = err;
      }
      mt.same(numeric.value.number, 4);

      numeric.$do.setNumber(2);
      mt.same(numeric.value.number, 2);
      mt.end();
    });

    mirTests.test('$update', (ut) => {
      const mir = new Subject({ x: 10, y: 20 });
      const [{ history }] = watch(mir);

      ut.same(history, [{ x: 10, y: 20 }]);

      mir.$update({ y: 30 });
      ut.same(history, [{ x: 10, y: 20 }, { x: 10, y: 30 }]);

      ut.end();
    });

    mirTests.test('mutable', (mut) => {
      const mir = new Subject({ a: 1, b: 2 }, { mutable: true });

      const { value } = mir;

      value.c = 3;

      mut.same(mir.value.c, 3);

      mut.end();
    });

    mirTests.end();
  });

  suite.end();
});

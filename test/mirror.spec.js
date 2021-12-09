import tap from 'tap';
import watchAll from '../watchAll';

const { inspect } = require('util');
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
      valTest.same(thrown, 'not a number');

      mir.next(4);

      valTest.same(values, [1, 2, 4]);

      valTest.end();
    });

    mirTests.end();
  });

  suite.end();
});

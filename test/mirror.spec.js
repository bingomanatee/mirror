import tap from 'tap';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}`, (eventTests) => {
    eventTests.test('next', (evTest) => {
      const mir = new Subject(1);

      const values = [];
      mir.subscribe((value) => values.push(value));

      evTest.same(values, [1]);

      mir.next(2);
      mir.next(3);
      evTest.same(values, [1, 2, 3]);

      evTest.end();
    });

    eventTests.end();
  });

  suite.end();
});

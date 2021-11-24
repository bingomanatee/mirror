import tap from 'tap';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}/events`, (eventTests) => {
    eventTests.test('$send', (evTest) => {
      const mir = new Subject(1);

      const values = [];
      mir.$events.subscribe((e) => values.push(e.value));

      mir.$send('foo', 1);
      mir.$send('foo', 2);
      mir.$send('foo', 3);

      evTest.same(values, [1, 2, 3]);

      evTest.end();
    });
    eventTests.test('$on', (evTest) => {
      const mir = new Subject(1);

      const values = [];
      mir.$on('alpha', (e) => values.push(e.value));

      mir.$send('alpha', 1);
      mir.$send('beta', 2);
      mir.$send('alpha', 3);

      evTest.same(values, [1, 3]);

      evTest.end();
    });

    eventTests.end();
  });

  suite.end();
});

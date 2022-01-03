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
  suite.test(`${subjectName}/clean`, (cleanTests) => {
    cleanTests.test('simple clean', (bf) => {
      const values = [];
      const mir = new Subject(4, {
        cleaner(value) {
          if (typeof value === 'number') {
            return Math.floor(value);
          }
          return value;
        },
      });
      mir.subscribe((v) => values.push(v));

      mir.next(8.2);

      bf.same(mir.value, 8);
      bf.same(values, [4, 8]);

      bf.end();
    });

    cleanTests.end();
  });

  suite.end();
});

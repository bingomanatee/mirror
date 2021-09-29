import tap from 'tap';

const p = require('./../../package.json');

const subjectName = 'Mirror';
const lib = require('./../../lib/index');

const { TYPE_VALUE } = lib;

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {
    suiteTests.test('constructor', (tConst) => {
      tConst.test('basic value, no config', (cBasic) => {
        const m = new Subject(1);
        cBasic.equal(m.value, 1);
        cBasic.same(m.$type, TYPE_VALUE);
        cBasic.end();
      });

      tConst.end();
    });

    suiteTests.end();
  });

  suite.end();
});

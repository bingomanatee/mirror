import tap from 'tap';

const p = require('../../package.json');

const subjectName = 'utils';
const lib = require('../../lib');

const { TYPE_VALUE } = lib;

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}`, (suiteTests) => {
    suiteTests.test('isMap', (tIsMap) => {
      tIsMap.ok(Subject.isMap(new Map()));

      tIsMap.notOk(Subject.isMap(3));

      tIsMap.end();
    });

    suiteTests.end();
  });

  suite.end();
});

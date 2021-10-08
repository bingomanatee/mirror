import tap from 'tap';
import { basename } from 'path';

const p = require('../package.json');

const subjectName = basename(__filename).replace(/\..*$/, '');
const lib = require('../lib');

const { TYPE_VALUE } = lib;

const Subject = lib[subjectName];

tap.test(p.name, (suite) => {
  suite.test(`${subjectName}`, (suiteTests) => {
    suiteTests.test('constructor', (tC) => {
      const MOCK_TARGET = {};
      const event = new Subject(1, 'number', MOCK_TARGET);
      tC.same(event.$type, 'number');
      tC.same(event.value, 1);
      tC.same(event.$target, MOCK_TARGET);
      tC.notOk(event.isStopped);
      tC.end();
    });

    suiteTests.test('$perform', (pe) => {
      const MOCK_TARGET = {};

      const event = new Subject(1, 'number', MOCK_TARGET);

      const stages = [];

      event.$perform().subscribe(({ stage }) => stages.push(stage));
      pe.same(stages, 'init,validate,perform,post,final'.split(','));
      event.next(3);
      pe.same(stages, 'init,validate,perform,post,final'.split(','));

      pe.end();
    });

    suiteTests.end();
  });

  suite.end();
});

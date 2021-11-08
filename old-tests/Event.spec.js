import tap from 'tap';
import { basename } from 'path';
import { STAGE_ERROR, STAGE_VALIDATE } from '../src/constants';
import { e } from '../src/utils';

const p = require('../package.json');

const subjectName = basename(__filename)
  .replace(/\..*$/, '');
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

    suiteTests.end();
  });

  suite.end();
});

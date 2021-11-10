import tap from 'tap';
import _ from 'lodash';
import { map } from 'rxjs/operators';
import watch from '../../watch';

const p = require('../../package.json');

const subjectName = 'Mirror';
const lib = require('../../lib/index');

const {
  TYPE_VALUE,
  TYPE_OBJECT,
  STAGE_INIT,
  STAGE_VALIDATE,
  STAGE_PERFORM,
  STAGE_POST,
  STAGE_FINAL,
  STAGE_ERROR,
  TRANS_STATE_NEW,
  TRANS_STATE_COMPLETE,
  TRANS_STATE_ERROR,
  TRANS_TYPE_CHANGE,
  TRANS_TYPE_ACTION,
  utils,
  e,
} = lib;

const NNV = 'non-numeric value';

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {

    suiteTests.test('actions', (act) => {
      const m = new Subject({
        a: 1,
        b: 2,
      }, {
        actions: {
          double: (mirror) => {
            mirror.$do.setA(mirror.value.a * 2);
            mirror.$do.setB(mirror.value.b * 2);
          },

          scale: (mirror, power) => {
            mirror.$do.setA(mirror.value.a * power);
            mirror.$do.setB(mirror.value.b * power);
          },
        },
      });

      const [{ history }] = watch(m);

      const FIRST = {
        a: 1,
        b: 2,
      };
      act.same(history, [FIRST]);

      m.$do.setA(4);

      const SECOND = {
        a: 4,
        b: 2,
      };
      act.same(history, [FIRST, SECOND]);

      m.$do.double();

      const THIRD = {
        a: 8,
        b: 2,
      };
      const FOURTH = {
        a: 8,
        b: 4,
      };
      act.same(history, [FIRST, SECOND, THIRD, FOURTH]);

      m.$do.scale(0.5);

      const FIFTH = {
        a: 4,
        b: 4,
      };
      act.same(history, [FIRST, SECOND, THIRD, FOURTH, FIFTH, SECOND]);

      act.end();
    });

    suiteTests.end();
  });

  suite.end();
});

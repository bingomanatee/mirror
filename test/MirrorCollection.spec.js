/* eslint-disable camelcase */

const tap = require('tap');
const p = require('./../package.json');

const subjectName = 'MirrorCollection';
const lib = require('./../lib/index');
const watch = require('./util/watch');

const Subject = lib[subjectName];

const ORIGIN = { x: 0, y: 0 };
const ORIGIN_2 = { x: 10, y: 0 };
const ORIGIN_MAP = lib.asMap(ORIGIN);
const ORIGIN_MAP_2 = lib.asMap(ORIGIN_2);
const BAR = 'bar';
const ERR = new Error('life is hard');

tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('as object', (ob) => {
      ob.test('constructor', (con) => {
        const mir = new Subject(ORIGIN);
        con.same(mir.value, ORIGIN);

        con.end();
      });

      ob.test('subscribe', (sub) => {
        /**
         * @type MirrorCollection
         */
        const mir = new Subject(ORIGIN);

        sub.notOk(mir._$isMap);
        const [log, s] = watch(mir);

        sub.same(log, ({
          history: [ORIGIN],
          errors: [],
        }));

        sub.same(mir.value, ORIGIN);

        mir.$set('x', 10);
        sub.same(log, ({
          history: [ORIGIN, ORIGIN_2],
          errors: [],
        }));

        s.unsubscribe();
        sub.end();
      });

      ob.end();
    });
    subjectSuite.test('as map', (mp) => {
      mp.test('constructor', (con) => {
        const mir = new Subject(ORIGIN_MAP);
        con.same(mir.value, ORIGIN_MAP);

        con.end();
      });

      mp.test('subscribe', (sub) => {
        /**
         * @type MirrorCollection
         */
        const mir = new Subject(ORIGIN_MAP);

        sub.ok(mir._$isMap);
        const [log, s] = watch(mir);

        sub.same(log, ({
          history: [ORIGIN_MAP],
          errors: [],
        }));

        sub.same(mir.value, ORIGIN_MAP);

        mir.$set('x', 10);
        sub.same(log, ({
          history: [ORIGIN_MAP, ORIGIN_MAP_2],
          errors: [],
        }));

        s.unsubscribe();
        sub.end();
      });

      mp.end();
    });


    subjectSuite.end();
  });

  suite.end();
});

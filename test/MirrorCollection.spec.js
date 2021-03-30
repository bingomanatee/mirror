/* eslint-disable camelcase */

const tap = require('tap');
const p = require('./../package.json');

const subjectName = 'MirrorCollection';
const lib = require('./../lib/index');
const watch = require('./util/watch');

const Subject = lib[subjectName];

const ORIGIN = { x: 0, y: 0 };
const ORIGIN_MAP = lib.asMap(ORIGIN);
const ORIGIN_MAP_2 = lib.asMap({ x: 10, y: 0 });
const BAR = 'bar';
const ERR = new Error('life is hard');

tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('constructor', (con) => {
      const mir = new Subject(ORIGIN);
      con.same(mir.value, ORIGIN_MAP);

      con.end();
    });

    subjectSuite.test('subscribe', (sub) => {
      /**
       * @type MirrorCollection
        */
      const mir = new Subject(ORIGIN);
      const [log, s] = watch(mir);

      sub.same(log, ({
        history: [ORIGIN_MAP],
        errors: [],
      }));

      mir.$set('x', 10);
      sub.same(log, ({
        history: [ORIGIN_MAP, ORIGIN_MAP_2],
        errors: [],
      }));

      s.unsubscribe();
      sub.end();
    });

    subjectSuite.end();
  });

  suite.end();
});

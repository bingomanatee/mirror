/* eslint-disable camelcase */

const tap = require('tap');
const p = require('./../package.json');

const subjectName = 'Event';
const lib = require('./../lib/index');
const watch = require('./util/watch');

const subject = lib[subjectName];
const Subject = subject;

const FOO = 'foo';
const BAR = 'bar';
const ERR = new Error('life is hard');

tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('constructor', (con) => {
      con.test('no Action', (conNoAction) => {
        const instance = new Subject(FOO);

        conNoAction.same(instance.value, FOO);
        conNoAction.notOk(instance.action);
        conNoAction.notOk(instance.target);

        conNoAction.end();
      });
      con.test('no Target', (conNoAction) => {
        const instance = new Subject(FOO, BAR);

        conNoAction.same(instance.value, FOO);
        conNoAction.same(instance.action, BAR);
        conNoAction.notOk(instance.target);

        conNoAction.end();
      });

      con.end();
    });

    subjectSuite.test('Subject interface', (si) => {
      const instance = new Subject(FOO);
      const [log, s] = watch(instance);
      si.same(log, { errors: [], history: [FOO] });

      instance.next(BAR);
      si.same(log, { errors: [], history: [FOO, BAR] });

      instance.error(ERR);

      si.same(log, { errors: [ERR], history: [FOO, BAR] });

      si.same(instance.last, BAR);
      s.unsubscribe();
      si.end();
    });


    subjectSuite.end();
  });

  suite.end();
});

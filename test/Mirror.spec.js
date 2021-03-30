/* eslint-disable camelcase */
const tap = require('tap');
const p = require('./../package.json');

const subjectName = 'Mirror';
const lib = require('./../lib/index');
const watch = require('./util/watch');
const watchEvents = require('./util/watchEvents');

const Subject = lib[subjectName];

const FOO = 'foo';
const BAR = 'bar';
const ERR = new Error('life is hard');

tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('constructor', (con) => {
      const mir = new Subject(FOO);
      con.same(mir.value, FOO);

      con.end();
    });

    subjectSuite.test('subscribe', (sub) => {
      const mir = new Subject(FOO);

      const [log, s] = watch(mir);

      sub.same(log, ({
        history: [FOO],
        errors: [],
      }));

      s.unsubscribe();
      sub.end();
    });

    subjectSuite.test('$on/$send', (os) => {
      const mir = new Subject(FOO);
      const events = [];
      mir.$on(FOO, (evt) => {
        events.push({
          action: evt.action,
          msg: 'value',
          value: evt.value,
        });
        evt.subscribe({
          complete() {
            events.push({
              action: evt.action,
              msg: 'complete',
            });
          },
        });
      });
      mir.$send(FOO, 2);
      os.same(events, [
        {
          action: FOO,
          value: 2,
          msg: 'value',
        },
        {
          action: FOO,
          msg: 'complete',
        },
      ]);
      os.end();
    });

    subjectSuite.test('$on - phases', (phases) => {
      phases.test('can cancel an event before another listener recieves it', (cancel) => {
        const mir = new Subject(FOO);
        let handled = false;
        mir.$on('alpha', (evt) => evt.complete(), lib.PHASE_PRE);
        mir.$on('alpha', (evt) => handled = true, lib.PHASE_ON);
        mir.$send('alpha', 1);
        cancel.notOk(handled);
        cancel.end();
      });
      phases.end();
    });

    subjectSuite.test('$send - phases', (send) => {
      const mir = new Subject(FOO);
      const [log] = watchEvents(mir);
      mir.$send(BAR, 1);
      mir.$send('alpha', 2);

      send.same(log, {
        history: [{
          value: 1,
          phase: -1,
          action: 'bar',
        }, {
          value: 1,
          phase: 0,
          action: 'bar',
        }, {
          value: 1,
          phase: 1,
          action: 'bar',
        }, {
          value: 2,
          phase: -1,
          action: 'alpha',
        }, {
          value: 2,
          phase: 0,
          action: 'alpha',
        }, {
          value: 2,
          phase: 1,
          action: 'alpha',
        }],
        errors: [],
      });
      send.end();
    });

    subjectSuite.test('actions', (acts) => {
      const mir = new Subject(10, {
        actions: {
          double: ((self) => self.next(self.value * 2)),
          add: ((self, n) => self.next(self.value + n)),
        },
      });

      acts.same(mir.value, 10);
      mir.$do('double');
      acts.same(mir.value, 20);
      mir.$do('add', 5);
      acts.same(mir.value, 25);
      mir.$do('double');
      acts.same(mir.value, 50);

      acts.end();
    });

    subjectSuite.end();
  });

  suite.end();
});

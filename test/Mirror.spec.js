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
          square: ((self) => self.value ** 2),
        },
      });

      acts.same(mir.value, 10);
      mir.$do.double();
      acts.same(mir.value, 20);
      mir.$do.add(5);
      acts.same(mir.value, 25);
      mir.$do.double();
      acts.same(mir.value, 50);

      acts.same(mir.$do.square(), 2500);

      acts.end();
    });

    subjectSuite.test('proxy', (p) => {
      const mir = new Subject(10, {
        actions: {
          double: ((self) => self.next(self.value * 2)),
          add: ((self, n) => self.next(self.value + n)),
        },
      });


      const proxy = mir.$p;
      const [log] = watch(proxy);

      p.same(proxy.value, 10);

      proxy.double();

      proxy.add(5);

      p.same(proxy.value, 25);

      p.same(log, {
        history: [10, 20, 25],
        errors: [],
      });
      p.end();
    });

    subjectSuite.test('transactions', (trans) => {
      trans.test('suppresses transactional value until end of trans', (transSimple) => {
        const mirr = new Subject(10);
        const [log] = watch(mirr);
        const transValues = [];
        mirr.$subscribe((v) => transValues.push(v));
        transSimple.same(log, {
          history: [10],
          errors: [],
        });

        transSimple.same(transValues, [10]);

        mirr.next(20);

        transSimple.same(log, {
          history: [10, 20],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);

        const s = mirr.$trans();

        mirr.next(30);

        transSimple.same(log, {
          history: [10, 20, 30],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);

        mirr.next(40);

        transSimple.same(log, {
          history: [10, 20, 30, 40],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);

        s.complete();

        transSimple.same(log, {
          history: [10, 20, 30, 40],
          errors: [],
        });

        transSimple.same(transValues, [10, 20, 40]);

        transSimple.end();
      });

      trans.test('multiple transactions', (transSimple) => {
        const mirr = new Subject(10);
        const [log] = watch(mirr);
        const transValues = [];
        mirr.$subscribe((v) => transValues.push(v));
        transSimple.same(log, {
          history: [10],
          errors: [],
        });

        transSimple.same(transValues, [10]);

        mirr.next(20);

        transSimple.same(log, {
          history: [10, 20],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);

        const s = mirr.$trans();

        mirr.next(30);

        transSimple.same(log, {
          history: [10, 20, 30],
          errors: [],
        });

        const s2 = mirr.$trans();

        transSimple.same(transValues, [10, 20]);

        mirr.next(40);

        transSimple.same(log, {
          history: [10, 20, 30, 40],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);

        s.complete();

        transSimple.same(log, {
          history: [10, 20, 30, 40],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);

        mirr.next(50);

        transSimple.same(log, {
          history: [10, 20, 30, 40, 50],
          errors: [],
        });

        transSimple.same(transValues, [10, 20]);
        s2.complete();


        transSimple.same(log, {
          history: [10, 20, 30, 40, 50],
          errors: [],
        });

        transSimple.same(transValues, [10, 20, 50]);

        transSimple.end();
      });
      trans.end();
    });

    subjectSuite.end();
  });

  suite.end();
});

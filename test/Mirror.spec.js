import tap from 'tap';
import _ from 'lodash';
import { map } from 'rxjs/operators';
import watch from '../watch';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib/index');

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
} = lib;

const NNV = 'non-numeric value';

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {
    suiteTests.test('constructor', (tConst) => {
      tConst.test('basic value, no config', (cBasic) => {
        const m = new Subject(1);
        cBasic.equal(m.value, 1);
        cBasic.same(m.$type, TYPE_VALUE);

        m.next(2);
        cBasic.equal(m.value, 2);
        cBasic.end();
      });

      tConst.test('config: name', (cName) => {
        const m = new Subject(1, { name: 'Bob' });
        cName.same(m.$name, 'Bob');
        cName.end();
      });

      tConst.end();
    });

    suiteTests.test('next/validation', (tTest) => {
      const m = new Subject(1, {
        name: 'Testy',
        test: (v) => {
          if (!utils.isNumber(v)) {
            throw new Error('non-numeric value');
          }
        },
      });

      const [{
        history,
        errors,
      }] = watch(m);

      tTest.same(errors.length, 0);
      tTest.same(history, [1]);
      tTest.same(m.value, 1);

      m.next(2);
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);

      let thrown = null;
      try {
        m.next('three');
      } catch (err) {
        thrown = err;
      }
      tTest.same(thrown.message, NNV);

      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);

      m.next(4);
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2, 4]);

      m.complete();
      tTest.end();
    });

    suiteTests.test('events', (ev) => {
      ev.test('events - basic', (ee) => {
        const m = new Subject('value');

        const [{
          history,
        }] = watch(m.$_eventQueue.pipe(map((e) => ({
          ...e,
          value: e.value,
        }))));
        m.$event('send', 'event');
        ee.same(
          _.map(history, (item) => _.pick(item, ['value', '$stage'])),
          [
            {
              $stage: STAGE_INIT,
              value: 'event',
            },
            {
              $stage: STAGE_VALIDATE,
              value: 'event',
            },
            {
              $stage: STAGE_PERFORM,
              value: 'event',
            },
            {
              $stage: STAGE_POST,
              value: 'event',
            },
            {
              $stage: STAGE_FINAL,
              value: 'event',
            },
          ],
        );
        m.$event('send', 'otherEvent');

        ee.same(
          _.map(history, (item) => _.pick(item, ['value', '$stage'])),
          [
            {
              $stage: STAGE_INIT,
              value: 'event',
            },
            {
              $stage: STAGE_VALIDATE,
              value: 'event',
            },
            {
              $stage: STAGE_PERFORM,
              value: 'event',
            },
            {
              $stage: STAGE_POST,
              value: 'event',
            },
            {
              $stage: STAGE_FINAL,
              value: 'event',
            },
            {
              $stage: STAGE_INIT,
              value: 'otherEvent',
            },
            {
              $stage: STAGE_VALIDATE,
              value: 'otherEvent',
            },
            {
              $stage: STAGE_PERFORM,
              value: 'otherEvent',
            },
            {
              $stage: STAGE_POST,
              value: 'otherEvent',
            },
            {
              $stage: STAGE_FINAL,
              value: 'otherEvent',
            },
          ],
        );

        ee.end();
      });
      ev.test('events - $on', (eo) => {
        const m = new Subject('value');
        const out = [];
        const pairs = [];

        m.$on('shoot', (value, phase) => {
          out.push(value);
          if (value === 'me') {
            phase.error('dont shoot me');
          }
        });

        m.$_eventQueue.subscribe({
          next(phase) {
            if (!phase.isStopped) {
              pairs.push(`${phase.value}-${phase.$stage}`);
            }
          },
          error(err) {
            console.log('caught error on eventQueue', err);
          },
        });

        eo.same(out, []);
        eo.same(pairs, []);

        m.$event('shoot', 'Bob');

        eo.same(out, ['Bob']);
        eo.same(pairs,
          [
            `Bob-${STAGE_INIT}`,
            `Bob-${STAGE_VALIDATE}`,
            `Bob-${STAGE_PERFORM}`,
            `Bob-${STAGE_POST}`,
            `Bob-${STAGE_FINAL}`,
          ]);

        m.$event('shoot', 'me');

        eo.same(out, ['Bob', 'me']);
        eo.same(pairs,
          [
            `Bob-${STAGE_INIT}`,
            `Bob-${STAGE_VALIDATE}`,
            `Bob-${STAGE_PERFORM}`,
            `Bob-${STAGE_POST}`,
            `Bob-${STAGE_FINAL}`,
            `me-${STAGE_INIT}`,
            `me-${STAGE_VALIDATE}`,
            `me-${STAGE_ERROR}`,
          ]);

        m.$event('shoot', 'You');
        eo.same(pairs,
          [
            `Bob-${STAGE_INIT}`,
            `Bob-${STAGE_VALIDATE}`,
            `Bob-${STAGE_PERFORM}`,
            `Bob-${STAGE_POST}`,
            `Bob-${STAGE_FINAL}`,
            `me-${STAGE_INIT}`,
            `me-${STAGE_VALIDATE}`,
            `me-${STAGE_ERROR}`,
            `You-${STAGE_INIT}`,
            `You-${STAGE_VALIDATE}`,
            `You-${STAGE_PERFORM}`,
            `You-${STAGE_POST}`,
            `You-${STAGE_FINAL}`,
          ], 'after you');

        eo.end();
      });
      ev.end();
    }, { skip: true });

    suiteTests.test('children', (ch) => {
      ch.test('basic ', (bas) => {
        const m = new Subject({
          x: 0,
          y: 0,
        }, {
          children: { z: 0 },
          name: 'basic-xyz',
        });

        const zChild = m.$children.get('z');
        m.subscribe((v) => console.log('basic-xyz value', v));
        m.$_pending.subscribe((list) => console.log('basic-xyz pending', JSON.stringify(list)));
        zChild.subscribe((v) => console.log('zChild value', v));
        zChild.$_pending.subscribe((list) => console.log('zChild pending', JSON.stringify(list)));

        bas.same(m.$type, TYPE_OBJECT);

        const [{ history }] = watch(m);

        bas.same(history, [{
          x: 0,
          y: 0,
          z: 0,
        }]);
        bas.same(m.value, {
          x: 0,
          y: 0,
          z: 0,
        });
        bas.same(m.$children.get('z').value, 0);

        m.next({
          x: 1,
          y: 1,
          z: 1,
        });
        bas.same(m.value, {
          x: 1,
          y: 1,
          z: 1,
        });
        bas.same(m.$children.get('z').value, 1);
        bas.same(history, [{
          x: 0,
          y: 0,
          z: 0,
        }, {
          x: 1,
          y: 1,
          z: 1,
        }]);

        m.$children.get('z')
          .next(2);

        bas.same(m.value, {
          x: 1,
          y: 1,
          z: 2,
        });
        bas.same(m.$children.get('z').value, 2);
        bas.same(history, [{
          x: 0,
          y: 0,
          z: 0,
        }, {
          x: 1,
          y: 1,
          z: 1,
        }, {
          x: 1,
          y: 1,
          z: 2,
        }]);

        bas.end();
      });

      ch.end();
    });

    suiteTests.test('$delete', (del) => {
      del.test('TYPE_VALUE', (dv) => {
        dv.test('(scalar)', (sc) => {
          const m = new Subject(1);
          sc.same(m.value, 1);

          m.$delete('foo');
          sc.same(m.value, 1);

          sc.end();
        });
        dv.test('(object)', (sc) => {
          const m = new Subject({
            foo: 1,
            bar: 2,
          }, { type: TYPE_VALUE });
          sc.same(m.value, {
            foo: 1,
            bar: 2,
          });

          m.$delete('foo');
          sc.same(m.value, { bar: 2 });

          sc.end();
        });
        dv.test('(map)', (sc) => {
          const m = new Subject(new Map([['foo', 1], ['bar', 2]]), { type: TYPE_VALUE });

          m.$delete('foo');
          sc.same(m.value, new Map([['bar', 2]]));

          sc.end();
        });

        dv.end();
      });
      del.test('TYPE_OBJECT', (sc) => {
        const m = new Subject({
          foo: 1,
          bar: 2,
        });
        sc.same(m.value, {
          foo: 1,
          bar: 2,
        });

        m.$delete('foo');
        sc.same(m.value, { bar: 2 });

        sc.end();
      });
      del.test('TYPE_MAP', (sc) => {
        const m = new Subject(new Map([['foo', 1], ['bar', 2]]));

        m.$delete('foo');
        sc.same(m.value, new Map([['bar', 2]]));

        sc.end();
      });
      del.end();
    });

    suiteTests.test('$mutate', (mut) => {
      mut.test('object', (mutObj) => {
        const m = new Subject({
          a: 1,
          b: 2,
        });
        const [{ history }] = watch(m);

        m.$mutate((draft) => {
          const {
            a,
            b,
          } = draft;
          return {
            a: b,
            b: a,
          };
        });

        mutObj.same(history, [{
          a: 1,
          b: 2,
        }, {
          a: 2,
          b: 1,
        }]);

        mutObj.end();
      });

      mut.end();
    });
    suiteTests.end();
  });

  suite.end();
});

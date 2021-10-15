import tap from 'tap';
import _ from 'lodash';
import watch from '../watch';
import { STAGE_PERFORM } from '../src/constants';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib/index');

const {
  TYPE_VALUE,
  utils,
  mirrorWatcher,
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

    suiteTests.test('test (next)', (tTest) => {
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

      m.next('three');
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

    suiteTests.test('test ($try)', (tTest) => {
      const m = new Subject(1, {
        name: 'Testy$try',
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
      tTest.notOk(m.$isTrying);

      m.$try(2);
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1]);
      tTest.ok(m.$isTrying);

      m.$flush();

      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);
      tTest.notOk(m.$isTrying);

      m.$try('three');
      tTest.same(m.value, 'three');
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);

      m.$flush();
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);
      tTest.notOk(m.$isTrying);

      m.$try(4);
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);
      tTest.ok(m.$isTrying);

      m.$flush();
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2, 4]);
      tTest.notOk(m.$isTrying);

      m.complete();
      tTest.end();
    });

    suiteTests.test('test ($try/$catch)', (tTest) => {
      const m = new Subject(1, {
        name: 'Testy$try$catch',
        test: (v) => {
          if (!utils.isNumber(v)) {
            throw new Error(NNV);
          }
        },
      });

      const [{
        history,
        errors,
      }] = watch(m);
      let caughtError = '';

      function doCatch(err) {
        caughtError = err;
      }

      tTest.same(errors.length, 0);
      tTest.same(history, [1]);
      tTest.same(m.value, 1);
      tTest.notOk(m.$isTrying);

      m.$try(2)
        .$catch(doCatch);
      tTest.same(m.getValue(), 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1]);
      tTest.ok(m.$isTrying);
      tTest.same(caughtError, '');

      m.$flush();
      tTest.same(m.getValue(), 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);
      tTest.notOk(m.$isTrying);
      tTest.same(caughtError, '');

      m.$try('three')
        .$catch(doCatch);
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(caughtError, new Error(NNV));
      tTest.same(history, [1, 2]);
      tTest.notOk(m.$isTrying);

      caughtError = '';
      m.$flush();
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);
      tTest.notOk(m.$isTrying);

      m.$try(4)
        .$catch(doCatch);
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);
      tTest.same(caughtError, '');
      tTest.ok(m.$isTrying);

      m.$flush();
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2, 4]);
      tTest.notOk(m.$isTrying);

      m.complete();
      tTest.end();
    });

    suiteTests.test('test ($try/$then/$catch)', (tTest) => {
      const m = new Subject(1, {
        name: 'ttc',
        test: (v) => {
          if (!utils.isNumber(v)) {
            throw new Error(NNV);
          }
        },
      });

      const [{
        history,
        errors,
      }] = watch(m);
      let caughtError = '';
      let thenHappened = false;

      function doThen() {
        thenHappened = true;
      }

      function saveError(err) {
        caughtError = err;
      }

      tTest.same(errors.length, 0);
      tTest.same(history, [1]);
      tTest.same(m.value, 1);
      tTest.notOk(m.$isTrying);

      m.$try(2)
        .$then(doThen)
        .$catch(saveError);
      tTest.same(m.getValue(), 2);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2]);

      tTest.notOk(m.$isTrying);
      tTest.notOk(caughtError);
      tTest.ok(thenHappened);

      thenHappened = false;
      m.$try('three')
        .$then(doThen)
        .$catch(saveError);
      tTest.same(m.value, 2);
      tTest.same(errors.length, 0);

      tTest.same(caughtError, new Error(NNV));
      tTest.notOk(m.$isTrying);
      tTest.notOk(thenHappened);

      tTest.same(history, [1, 2]);
      tTest.notOk(m.$isTrying);

      caughtError = '';
      m.$try(4)
        .$then(doThen)
        .$catch(saveError);
      tTest.same(m.value, 4);
      tTest.same(errors.length, 0);
      tTest.same(history, [1, 2, 4]);

      tTest.notOk(m.$isTrying);
      tTest.notOk(caughtError);
      tTest.ok(thenHappened);

      m.complete();
      tTest.end();
    });

    suiteTests.test('events', (ev) => {
      ev.test('events - basic', (ee) => {
        const m = new Subject('value');

        const [{
          history,
        }] = watch(m.$_eventQueue);
        m.$event('send', 'event');
        ee.same(
          _.map(history, (item) => _.pick(item, ['value', '$stage'])),
          [
            {
              $stage: 'init',
              value: 'event',
            },
            {
              $stage: 'validate',
              value: 'event',
            },
            {
              $stage: 'perform',
              value: 'event',
            },
            {
              $stage: 'post',
              value: 'event',
            },
            {
              $stage: 'final',
              value: 'event',
            },
          ],
        );
        m.$event('send', 'otherEvent');

        ee.same(
          _.map(history, (item) => _.pick(item, ['value', '$stage'])),
          [
            {
              $stage: 'init',
              value: 'event',
            },
            {
              $stage: 'validate',
              value: 'event',
            },
            {
              $stage: 'perform',
              value: 'event',
            },
            {
              $stage: 'post',
              value: 'event',
            },
            {
              $stage: 'final',
              value: 'event',
            },
            {
              $stage: 'init',
              value: 'otherEvent',
            },
            {
              $stage: 'validate',
              value: 'otherEvent',
            },
            {
              $stage: 'perform',
              value: 'otherEvent',
            },
            {
              $stage: 'post',
              value: 'otherEvent',
            },
            {
              $stage: 'final',
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
            if (!phase.isStopped) pairs.push(`${phase.value}-${phase.$stage}`);
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
            'Bob-init',
            'Bob-validate',
            'Bob-perform',
            'Bob-post',
            'Bob-final',
          ]);

        m.$event('shoot', 'me');

        eo.same(out, ['Bob', 'me']);
        eo.same(pairs,
          [
            'Bob-init',
            'Bob-validate',
            'Bob-perform',
            'Bob-post',
            'Bob-final',
            'me-init',
            'me-validate',
            'me-error',
          ]);

        m.$event('shoot', 'you');
        eo.same(pairs,
          [
            'Bob-init',
            'Bob-validate',
            'Bob-perform',
            'Bob-post',
            'Bob-final',
            'me-init',
            'me-validate',
            'me-error',
            'you-init',
            'you-validate',
            'you-perform',
            'you-post',
            'you-final',
          ], 'after you');

        eo.end();
      });
      ev.end();
    });

    suiteTests.end();
  });

  suite.end();
});

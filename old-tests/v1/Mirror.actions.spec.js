import tap from 'tap';
import transWatch from '../transWatch';

import SET_EXPECT from './expect/mirror-actions-set-expect.json';
import OFFSET_EXPECT from './expect/mirror-actions-offset-expect.json';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const NNV = 'non-numeric value';

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Object)`, (subjectTests) => {
    subjectTests.test('actions', (wa) => {
      wa.test('multi-field change', (wamf) => {
        // validating that all updates are postponed until
        // the action completes
        const m = new Subject({
          x: 0,
          y: 0,
        }, {
          actions: {
            doubleXY(trans) {
              trans.$do.setX(trans.value.x * 2);
              trans.$do.setY(trans.valye.y * 2);
            },

            offset(trans, x = 0, y = 0) {
              trans.$do.setX(trans.value.x + x);
              trans.$do.setY(trans.value.y + y);
            },
          },
        });

        const { queue } = transWatch(m);

        m.$do.offset(3, 4);

        console.log('---- mf queue', JSON.stringify(queue));

        wamf.same(queue,
          OFFSET_EXPECT);

        wamf.end();
      });

      wa.test('multi-field, with children', (wamfc) => {
        const m = new Subject({
          x: 0,
          y: 0,
        }, {
          transQueue: 'abcdefghijklmnopqrstuvwxyz'.split(''),
          actions: {
            doubleXY(trans) {
              trans.$do.setX(trans.value.x * 2);
              trans.$do.setY(trans.valye.y * 2);
            },

            offset(trans, x = 0, y = 0) {
              trans.$do.setX(trans.value.x + x);
              trans.$do.setY(trans.value.y + y);
            },
          },
          children: {
            x: new Subject(0, {
              test(value) {
                if (typeof value !== 'number') {
                  throw NNV;
                }
              },
            }),
          },
        });

        const mTrace = transWatch(m);

        const xChild = m.$children.get('x');

        xChild.subscribe((value) => {
          console.log('X value: ', value);
        });

        const cTrace = transWatch(m.$children.get('x'));

        m.$do.offset(4, 7);

        console.log('->>-- ca queue:', mTrace.toString());
        console.log(' -->-- ca-child-queue', cTrace.toString());

        wamfc.end();
      });

      wa.end();
    });

    subjectTests.test('$set', (st) => {
      const m = new Subject({
        x: 0,
        y: 0,
      }, {
        transQueue: 'abcdefghijklmnopqrstuvwxyz'.split(''),
      });
      const { queue } = transWatch(m);

      m.$set('x', 3);
      st.same(m.value.x, 3);
      st.same(m.value.y, 0);
      console.log('------ set queue:', JSON.stringify(queue));
      delete queue[2].value.fn;
      st.same(queue,
        SET_EXPECT);
      st.end();
    });

    subjectTests.end();
  });

  suite.end();
});

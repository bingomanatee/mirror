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
  suite.test(`${subjectName} (Value type)`, (subjectTests) => {
    subjectTests.test('actions', (wa) => {
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
            console.log('---- starting offset,', trans, x, y);
            try {
              trans.$do.setX(trans.value.x + x);
              trans.$do.setY(trans.value.y + y);
            } catch (err) {
              console.log('--- error in offset', err);
              throw err;
            }
          },
        },
      });

      const { queue } = transWatch(m);

      m.$do.offset(3, 4);

      console.log('---- action queue', JSON.stringify(queue));

      wa.same(queue,
        OFFSET_EXPECT);

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
      console.log('set queue:', JSON.stringify(queue));
      st.ok(typeof queue[2].value.fn === 'function');
      delete queue[2].value.fn;
      st.same(queue,
        SET_EXPECT);
      st.end();
    });

    subjectTests.end();
  });

  suite.end();
});

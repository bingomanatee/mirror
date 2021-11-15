import tap from 'tap';
import _ from 'lodash';
import { map } from 'rxjs/operators';
import watch from '../watch';
import transWatch from '../transWatch';

const p = require('../package.json');

const subjectName = 'Mirror';
const lib = require('../lib');

const {
  TYPE_VALUE,
  utils,
  idGen,
} = lib;

idGen.enqueue('a,b,c,d,e,f,g,h,i,j'.split(','));

const NNV = 'non-numeric value';

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName} (Value type)`, (suiteTests) => {
    suiteTests.test('actions', (wa) => {
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

      console.log('---- action queue', JSON.stringify(queue));

      wa.same(queue,
        [{ pending: [] }, {
          currentValue: {
            x: 0,
            y: 0,
          },
        }, {
          type: 'event:action',
          value: {
            name: 'offset',
            args: [3, 4],
          },
        }]);

      wa.end();
    });

    suiteTests.end();
  });

  suite.end();
});

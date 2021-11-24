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
    subjectTests.test('children', (wa) => {
      const m = new Subject({ x: 0, y: 0 }, {
        children: {
          x: new Subject(0),
        },
      });
      const xValues = [];
      m.$children.get('x').subscribe((nX) => xValues.push(nX));

      m.next({ x: 4, y: 7 });
      console.log('---- children: ', xValues);
      wa.same(xValues, [0, 4]);
      wa.end();
    });

    subjectTests.end();
  });

  suite.end();
});

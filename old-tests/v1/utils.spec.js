import tap from 'tap';
import { mapFromKeys } from '../../src/utils';

const p = require('../../package.json');

const subjectName = 'utils';
const lib = require('../../lib');

const { TYPE_VALUE } = lib;

const Subject = lib[subjectName];
tap.test(p.name, (suite) => {
  suite.test(`${subjectName}`, (suiteTests) => {
    suiteTests.test('isMap', (tIsMap) => {
      tIsMap.ok(Subject.isMap(new Map()));

      tIsMap.notOk(Subject.isMap(3));

      tIsMap.end();
    });

    suite.test('introspection', (i) => {
      const myMap = new Map();
      const myArray = [];
      const myNum = 1;
      const zero = 0;
      const myString = 'foo';
      const emptyString = '';
      const myObj = {};

      const all = [myMap, myArray, myNum, zero, myString, emptyString, myObj, null];

      i.ok(Subject.isMap(myMap));
      all.filter((n) => n !== myMap).forEach((type) => i.notOk(Subject.isMap(type)));

      i.ok(Subject.isObj(myObj));
      all.filter((n) => n !== myObj).forEach((type) => i.notOk(Subject.isObj(type)));

      i.ok(Subject.isArr(myArray));
      all.filter((n) => n !== myArray).forEach((type) => i.notOk(Subject.isArr(type)));

      i.end();
    });

    suiteTests.test('e', (et) => {
      const e1 = Subject.e('alpha');
      et.same(e1.message, 'alpha');
      et.end();
    });

    suiteTests.test('mapFromKeys', (mfk) => {
      const map1 = new Map();
      map1.set('a', 2);
      map1.set('b', 3);
      map1.set('d', 5);

      const map2 = new Map();
      map2.set('a', []);
      map2.set('d', []);

      mfk.same(Subject.mapFromKeys(map1, map2), new Map([['a', 2], ['d', 5]]));
      mfk.end();
    });

    suiteTests.end();
  });

  suite.end();
});

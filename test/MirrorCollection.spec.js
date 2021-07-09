/* eslint-disable camelcase */

const tap = require('tap');
const p = require('./../package.json');

const subjectName = 'MirrorCollection';
const lib = require('./../lib/index');
const watch = require('./util/watch');

const Subject = lib[subjectName];
const { ACTION_NEXT, PHASE_INIT } = lib;

function constants() {
  const ORIGIN = {
    x: 0,
    y: 0,
  };
  const ORIGIN_2 = {
    x: 10,
    y: 0,
  };
  const ORIGIN_MAP = lib.asMap(ORIGIN, true);
  const ORIGIN_MAP_2 = lib.asMap(ORIGIN_2, true);
  const MAP_10_5 = lib.asMap({
    x: 10,
    y: 5,
  });
  const BAR = 'bar';
  const ERR = new Error('life is hard');

  return {
    ORIGIN,
    ORIGIN_2,
    ORIGIN_MAP,
    ORIGIN_MAP_2,
    MAP_10_5,
    BAR,
    ERR,
  };
}


tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('as object', (ob) => {
      ob.test('constructor', (con) => {
        const { ORIGIN } = constants();
        const mir = new Subject(ORIGIN);
        con.same(mir.value, ORIGIN);

        con.end();
      });

      ob.test('subscribe', (sub) => {
        const {
          ORIGIN,
          ORIGIN_2,
        } = constants();
        /**
         * @type MirrorCollection
         */
        const mir = new Subject(ORIGIN);

        sub.notOk(mir._$isMap);
        const [log, s] = watch(mir);

        sub.same(log, ({
          history: [ORIGIN],
          errors: [],
        }));

        sub.same(mir.value, ORIGIN);

        mir.$set('x', 10);
        sub.same(log, ({
          history: [ORIGIN, ORIGIN_2],
          errors: [],
        }));

        s.unsubscribe();
        sub.end();
      });

      ob.end();
    });
    subjectSuite.test('as map', (mp) => {
      mp.test('constructor', (con) => {
        const { ORIGIN_MAP } = constants();
        const mir = new Subject(ORIGIN_MAP);
        con.same(mir.value, ORIGIN_MAP);

        con.end();
      });

      mp.test('subscribe', (sub) => {
        const {
          ORIGIN_MAP,
          ORIGIN_MAP_2,
        } = constants();
        /**
         * @type MirrorCollection
         */
        const mir = new Subject(ORIGIN_MAP);

        sub.ok(mir._$isMap);
        const [log, s] = watch(mir);

        sub.same(log, ({
          history: [ORIGIN_MAP],
          errors: [],
        }));

        sub.same(mir.value, ORIGIN_MAP);

        mir.$set('x', 10);
        sub.same(log, ({
          history: [ORIGIN_MAP, ORIGIN_MAP_2],
          errors: [],
        }));

        s.unsubscribe();
        sub.end();
      });

      mp.test('$do', (doTest) => {
        const { ORIGIN_MAP } = constants();
        const mir = new Subject(ORIGIN_MAP,
          {
            actions: {
              offset(self, x, y) {
                const s = self.$trans();

                self.$do.setX(self.$my.x + x);
                self.$do.setY(self.$my.y + y);
                s.complete();
              },
            },
          });

        mir.$do.setX(10);
        doTest.same(mir.value.get('x'), 10, '$do setX changed x to 10');
        doTest.end();
      });

      mp.test('$value', (v$) => {
        const {
          ORIGIN_MAP,
          MAP_10_5,
        } = constants();
        const mir = new Subject(ORIGIN_MAP);
        const t = mir.$trans();
        mir.$set('x', 10);
        mir.$set('y', 5);
        v$.same(mir.$value, ORIGIN_MAP, '$value frozen during transaction');
        v$.same(mir.value, MAP_10_5);
        t.complete();

        v$.same(mir.$value, MAP_10_5, '$value updated after trans end');
        v$.same(mir.value, MAP_10_5);

        v$.end();
      });

      // @TODO: test proxy on object
      mp.test('proxy', (p) => {
        const { ORIGIN_MAP } = constants();
        const mir = new Subject(ORIGIN_MAP,
          {
            actions: {
              offset(self, x, y) {
                const s = self.$trans();

                self.$do.setX(self.$get('x') + x);
                self.$do.setY(self.$get('y') + y);
                s.complete();
              },
            },
          });

        try {
          const proxy = mir.$p;

          p.same(proxy.x, 0);
          p.same(proxy.y, 0);

          proxy.x = 10;

          p.same(proxy.x, 10);
          p.same(proxy.y, 0);

          proxy.offset(5, 4);

          p.same(proxy.x, 15);
          p.same(proxy.y, 4);
        } catch (err) {
          console.log('error in test: ', err);
        }

        p.end();
      });

      mp.test('child', (ch) => {
        const coordSubject = new Subject({}, {
          children: {
            x: 0,
            y: 0,
          },
        });
        function onValue(evt) {
          if (typeof evt.value !== 'number') {
            evt.error(new Error('not a number'));
          } else {
            const floor = Math.floor(evt.value);
            if (floor !== evt.value) evt.next(floor);
          }
        }
        coordSubject.$children.get('x')
          .$on(ACTION_NEXT, onValue);

        coordSubject.$children.get('y')
          .$on(ACTION_NEXT, onValue);

        coordSubject.$do.setX(20);
        ch.same(coordSubject.$my.x, 20);

        coordSubject.$do.setY(22.5);
        ch.same(coordSubject.$my.y, 22);

        coordSubject.$do.setX('33');
        ch.same(coordSubject.$my.x, 20);

        coordSubject.$do.setX(40);
        ch.same(coordSubject.$my.x, 40);

        coordSubject.next({ x: 50, y: 33.3 });

        ch.same(coordSubject.$my.x, 50);
        ch.same(coordSubject.$my.y, 33);

        coordSubject.next({ x: '3333', y: 40 });
        ch.same(coordSubject.$my.x, 50);
        ch.same(coordSubject.$my.y, 40);

        coordSubject.next({ x: 22.5, y: 'a thousand' });
        ch.same(coordSubject.$my.x, 22);
        ch.same(coordSubject.$my.y, 40);

        ch.end();
      });
      mp.end();
    });

    subjectSuite.end();
  });

  suite.end();
});

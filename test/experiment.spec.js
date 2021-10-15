import {
  catchError, filter, observeOn, subscribeOn, switchMap, tap,
} from 'rxjs/operators';
import {
  queueScheduler,
  scheduled,
  Observable,
  of,
  Subject,
  asyncScheduler,
  asapScheduler,
  animationFrameScheduler,
  from,
  throwError, combineLatest, BehaviorSubject,
  } from 'rxjs';
import _ from 'lodash';
import watch from '../watch';

const {
  produce,
  isDraft,
  isDraftable,
  enableMapSet,
} = require('immer');

enableMapSet();
const tapTest = require('tap');

tapTest.test('expeiments', (i) => {
  i.test('isDraftable?', (d) => {
    d.notOk(isDraftable(1));

    d.ok(isDraftable({
      a: 1,
      b: 2,
    }));

    d.notOk(isDraft({
      a: 1,
      b: 2,
    }));

    const obj = produce({
      a: 1,
      b: 2,
    }, () => {
    });
    d.ok(isDraftable(obj));

    d.end();
  });

  i.test('drafting numbers', (dn) => {
    const n = produce(2, () => {
    });
    dn.same(n, 2);

    const n2 = produce(2, (d) => d + 1);
    dn.same(n2, 3);

    dn.end();
  });

  i.test('switchMap', (sm) => {
    const isEven = (n) => {
      if (typeof n !== 'number') {
        throw new Error('must be a number');
      }
      return !(n % 2);
    };

    const source = new Subject();

    const output = source.pipe(switchMap((n) => of(n)
      .pipe(filter(isEven), catchError((e) => of()))));

    const out = [];
    output.subscribe(out.push.bind(out));

    source.next(1);
    source.next(2);
    source.next(3);
    source.next(4);
    source.next('5');
    source.next(6);
    source.next(7);
    source.next('eight');
    source.next('nine');
    source.next(10);

    sm.same(out, [2, 4, 6, 10]);

    sm.end();
  });

  /**
   * note - this pushes the thrown error into a mapped observer
   */
  i.test('catchError', (ce) => {
    const subjectRoot = new Subject();
    const subject = subjectRoot
      .pipe(
        switchMap((output) => of(output)
          .pipe(
            tap((value) => {
              if (!_.isNumber(value)) {
                throw {
                  value,
                  message: 'not a number',
                };
              }
            }),
            catchError((err) => of({ err })),
          )),
      );

    const output = [];
    const errors = [];
    subject.subscribe({
      next(v) {
        output.push(v);
      },
      error(err) {
        errors.push(err);
      },
    });

    subjectRoot.next(1);
    subjectRoot.next(2);
    subjectRoot.next('three');
    subjectRoot.next(4);

    ce.same(output, [1, 2, {
      err: {
        value: 'three',
        message: 'not a number',
      },
    }, 4]);
    ce.same(errors, []);

    subject.complete();

    ce.end();
  });

  i.test('combineLatest', (cl) => {
    const numbers = from([1, 2, 3]);
    const emitter = combineLatest(of('value'), numbers);
    const [{ history }] = watch(emitter);

    cl.same(history, [['value', 1], ['value', 2], ['value', 3]]);
    cl.end();
  });

  i.test('combineLatest with subject', (cl) => {
    const bs = new BehaviorSubject('value');
    const emitter = combineLatest(bs, from([1, 2, 3]));

    const [{ history, errors }, sub] = watch(emitter);

    cl.same(history, [['value', 1], ['value', 2], ['value', 3]]);
    cl.end();
  });

  i.test('switchMap with combineLatest', (scl) => {
    const emitter = new Subject()
      .pipe(
        switchMap((value) => {
          const bs = new BehaviorSubject('value');
          return combineLatest(bs, from([1, 2, 3]));
        }),
      );

    const [{ history, errors }, sub] = watch(emitter);
    emitter.next('value');

    scl.same(history, [['value', 1], ['value', 2], ['value', 3]]);

    scl.end();
  });

  /**
   * note - this pushes the thrown error into a mapped observer
   */
  i.test('mapped error', (ce) => {
    const subjectRoot = new Subject();
    const subject = subjectRoot
      .pipe(
        switchMap((output) => of(output)
          .pipe(
            tap((value) => {
              if (!_.isNumber(value)) {
                throw {
                  value,
                  message: 'not a number',
                };
              }
            }),
          )),
      );

    const output = [];
    const errors = [];
    subject.subscribe({
      next(v) {
        output.push(v);
      },
      error(err) {
        errors.push(err);
      },
    });

    subjectRoot.next(1);
    subjectRoot.next(2);
    subjectRoot.next('three');
    subjectRoot.next(4);

    ce.same(output, [1, 2]);
    ce.same(errors, [{
      value: 'three',
      message: 'not a number',
    }]);

    subject.complete();

    ce.end();
  });

  i.test('schehduled', (sTest) => {
    const subjectA = new Subject();
    const queue = [];

    subjectA.subscribe((value) => queue.push(value));
    subjectA.subscribe((value) => queue.push(value));

    subjectA.next(1);
    subjectA.next(2);
    subjectA.next(3);
    subjectA.next(4);
    sTest.same(queue, [1, 1, 2, 2, 3, 3, 4, 4]);

    const subjectB = new Subject();
    const b = subjectB;
    const bQueue = [];
    b.subscribe((n) => bQueue.push(n));
    b.subscribe((n) => bQueue.push(n));
    b.subscribe((n) => bQueue.push(n));
    b.subscribe({
      next(v) {
        if (v === 4) {
          subjectB.complete();
        }
      },
      complete() {
        sTest.same(bQueue, [
          1, 1, 1, 2, 2,
          2, 3, 3, 3, 4,
          4, 4,
        ]);
        sTest.end();
      },
    });
    subjectB.next(1);
    subjectB.next(2);
    subjectB.next(3);
    sTest.same(bQueue, [1, 1, 1, 2, 2, 2, 3, 3, 3]);
    subjectB.next(4);
  });

  i.end();
});

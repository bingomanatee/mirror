import { catchError, filter, switchMap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';

const {
  produce, isDraft, isDraftable, enableMapSet,
} = require('immer');

enableMapSet();
const tap = require('tap');

tap.test('expeiments', (i) => {
  i.test('isDraftable?', (d) => {
    d.notOk(isDraftable(1));

    d.ok(isDraftable({ a: 1, b: 2 }));

    d.notOk(isDraft({ a: 1, b: 2 }));

    const obj = produce({ a: 1, b: 2 }, () => {});
    d.ok(isDraftable(obj));

    d.end();
  });

  i.test('drafting numbers', (dn) => {
    const n = produce(2, () => {});
    dn.same(n, 2);

    const n2 = produce(2, (d) => d + 1);
    dn.same(n2, 3);

    dn.end();
  });

  i.test('switchMap', (sm) => {
    const isEven = (n) => {
      if (typeof n !== 'number') throw new Error('must be a number');
      return !(n % 2);
    };

    const source = new Subject();

    const output = source.pipe(switchMap((n) => {
      return of(n).pipe(filter(isEven), catchError((e) => of()));
    }));


    const out = [];
    output.subscribe(out.push.bind(out));

    source.next(1);
    source.next(2);
    source.next(3);
    source.next(4);

    console.log('out', out);

    source.next('5');
    source.next(6);
    source.next(7);
    source.next('eight');
    source.next('nine');
    source.next(10);

    sm.same(out, [2, 4, 6, 10]);

    sm.end();
  });


  i.end();
});

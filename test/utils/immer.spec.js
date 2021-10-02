const {
  produce, isDraft, isDraftable, enableMapSet,
} = require('immer');

enableMapSet();
const tap = require('tap');

tap.test('immer', (i) => {
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

    const n2 = produce(2, (d) => {
      return d + 1;
    });
    dn.same(n2, 3);

    dn.end();
  });

  i.end();
});

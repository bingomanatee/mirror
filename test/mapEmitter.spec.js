/* eslint-disable camelcase */

import { BehaviorSubject, Subject } from 'rxjs';

const tap = require('tap');
const p = require('./../package.json');
const lib = require('./../lib/index');

const subjectName = 'mapEmitter';

const subject = lib[subjectName];

const FOO = 'foo';
const BAR = 'bar';
const ERR = new Error('life is hard');

tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('simple behavior without errors', (simple) => {
      const invulnerableSubject = subject(0, (n) => n * 2);

      const history = [];
      const errors = [];
      invulnerableSubject.subscribe({
        next: history.push.bind(history),
        error: errors.push.bind(errors),
      });

      invulnerableSubject.next(1);
      simple.same({
        history, errors,
      }, { history: [0, 2], errors: [] });

      invulnerableSubject.next(2);
      simple.same({
        history, errors,
      }, { history: [0, 2, 4], errors: [] });

      simple.end();
    });
    subjectSuite.test('recovers from errors', (rec) => {
      const invulnerableSubject = subject(0,
        (n) => {
          if (!(typeof n === 'number') || Number.isNaN(n)) {
            throw Object.assign(new Error('n must be a number'), 
              { n });
          }
          return n * 2;
        }, ({ n }) => n);
      const history = [];
      const errors = [];

      invulnerableSubject.subscribe({
        next: history.push.bind(history),
        error: errors.push.bind(errors),
      });

      invulnerableSubject.next(1);
      rec.same({
        history, errors,
      }, { history: [0, 2], errors: [] });
      invulnerableSubject.next('three');
      rec.same({
        history, errors,
      }, { history: [0, 2, 'three'], errors: [] });

      invulnerableSubject.next(3);
      rec.same({
        history, errors,
      }, { history: [0, 2, 'three', 6], errors: [] });


      rec.end();
    });


    subjectSuite.end();
  });

  suite.end();
});

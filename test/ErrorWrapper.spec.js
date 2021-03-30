/* eslint-disable camelcase */

const tap = require('tap');
const p = require('./../package.json');

const subjectName = 'ErrorWrapper';
const lib = require('./../lib/index');

const subject = lib[subjectName];
const Subject = subject;

tap.test(p.name, (suite) => {
  suite.test(subjectName, (subjectSuite) => {
    subjectSuite.test('constructor', (con) => {
      con.test('no event', (conNoEvent) => {
        let error = null;
        try {
          // eslint-disable-next-line no-unused-vars
          const instance = new Subject('foo');
        } catch (err) {
          error = err;
        }

        conNoEvent.same(error.message, lib.errorWrapperParamErrorMsg);

        conNoEvent.end();
      });
      con.test('with Event, error string;', (conEvent) => {
        const instance = new Subject('foo', new lib.Event('alpha', 'bar'));

        conEvent.same(instance.error, 'foo');
        conEvent.same(instance.message, 'foo');
        conEvent.notOk(instance.isStopped);

        conEvent.end();
      });
      con.test('with Event, Error;', (conEvent) => {
        const err = new Error('foo');
        const instance = new Subject(err, new lib.Event('alpha', 'bar'));

        conEvent.same(instance.error, err);
        conEvent.same(instance.message, 'foo');
        conEvent.notOk(instance.isStopped);

        conEvent.end();
      });

      con.end();
    });


    subjectSuite.end();
  });

  suite.end();
});

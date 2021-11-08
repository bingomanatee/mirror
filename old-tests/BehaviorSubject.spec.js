import tap from 'tap';
import { BehaviorSubject } from 'rxjs';

tap.test('BehaviorSubject', (suite) => {

  suite.test('it should reflect its constructor', (cTest) => {
    const subject = new BehaviorSubject(2);
    cTest.same(subject.value, 2);
    cTest.end();
  });
  suite.end();
});

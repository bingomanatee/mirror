import {
  catchError,
  dematerialize, filter, map, materialize, switchMap, tap, retryWhen, share,
} from 'rxjs/operators';
import {
  BehaviorSubject, Notification, Subject, of,
} from 'rxjs';
import { SKIP, identity } from './constants';

/**
 * returns a pipe of a subject that returns any errors as values.
 * @param subject
 * @param ifErr
 * @returns {*}
 */
export default function mapEmitter(start = SKIP, op = identity, ifErr = (a) => a) {
  return new BehaviorSubject(start).pipe(
    switchMap((value) => of(value)
      .pipe(
        map(op),
        catchError((err) => of(ifErr(err))),
      )),
    filter((v) => v !== SKIP),
    share(),
  );
}

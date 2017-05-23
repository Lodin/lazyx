import {Observable} from 'rxjs/Observable';
import {scan} from 'rxjs/operator/scan';
import {Reducer} from '../typings';

export default function apply<T>(this: Observable<T | Reducer<T>>): Observable<T> {
  return scan.call(
    this,
    (state: T, reducer: Reducer<T>) => reducer(state),
  );
}

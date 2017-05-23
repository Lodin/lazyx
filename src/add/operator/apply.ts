import {Observable} from 'rxjs/Observable';
import {apply} from '../../operator/apply';

Observable.prototype.apply = apply;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    apply: typeof apply;
  }
}

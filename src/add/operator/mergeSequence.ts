import {Observable} from 'rxjs/Observable';
import mergeSequence from '../../operator/mergeSequence';

Observable.prototype.mergeSequence = mergeSequence;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    mergeSequence: typeof mergeSequence;
  }
}

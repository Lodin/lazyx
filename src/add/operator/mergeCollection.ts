import {Observable} from 'rxjs/Observable';
import mergeCollection from '../../operator/mergeCollection';

Observable.prototype.mergeCollection = mergeCollection;

declare module 'rxjs/Observable' {
  interface Observable<T> {
    mergeCollection: typeof mergeCollection;
  }
}

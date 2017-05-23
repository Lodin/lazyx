import {Observable} from 'rxjs/Observable';

export type TransformerCreator<T> = (state: T) => Observable<T>;
export type Reducer<T> = (state: T) => T;

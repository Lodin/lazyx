import {Observable} from 'rxjs/Observable';

export interface Mapper<T> {
  [key: string]: Mapper<T> | T;
}

export interface TransformerCreator {
  <T>(state: T): Observable<T>;
  <T, U>(state: T): Observable<U>;
}

export interface Middleware {
  <T>(transformer: Observable<T>): Observable<T>;
  <T, U>(transformer: Observable<T>): Observable<U>;
}

export type Reducer<T> = (state: T) => T;

export type JSONValue = string | number | boolean | JSONObject | JSONArray;

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

import * as isPlainObject from 'is-plain-object';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {map} from 'rxjs/operator/map';
import {merge} from 'rxjs/operator/merge';
import {mergeMap} from 'rxjs/operator/mergeMap';
import {Subject} from 'rxjs/Subject';
import {Reducer, TransformerCreator} from '../typings';

export type MixedArrayState<T> = T[] | Observable<T>[];
export type ArrayState<T> = Observable<T>[];
export type ArrayAddPayload<T> = T;
export type ArrayRemovePayload = number;

export type MixedObjectState = {[key: string]: any | Observable<any>};
export type ObjectState = {[key: string]: Observable<any>};
export type ObjectAddPayload = [string, any];
export type ObjectRemovePayload = string;

/* tslint:disable:max-line-length */
export default function mergeSequence<T>(this: Observable<MixedArrayState<T>>, addTrigger: Subject<ArrayAddPayload<T>>, removeTrigger: Subject<ArrayRemovePayload>, create: TransformerCreator): Observable<Reducer<ArrayState<T>>>;
export default function mergeSequence(this: Observable<MixedObjectState>, addTrigger: Subject<ObjectAddPayload>, removeTrigger: Subject<ObjectRemovePayload>, create: TransformerCreator): Observable<Reducer<ObjectState>>;
/* tslint:enable:max-line-length */

export default function mergeSequence(
  this: any,
  addTrigger: any,
  removeTrigger: any,
  create: TransformerCreator,
): any {
  return mergeMap.call(
    this,
    (state: any) => {
      if (!Array.isArray(state) && !isPlainObject(state)) {
        throw new TypeError('Observable value for "mergeSequence" should be an array or a plain object');
      }

      if (Array.isArray(state)) {
        return mergeArray(prepareArrayState(this, state, create), addTrigger, removeTrigger, create);
      }

      return mergeObject(prepareObjectState(this, state, create), addTrigger, removeTrigger, create);
    },
  );
}

function prepareArrayState<T>(
  observable: Observable<MixedArrayState<T>>,
  state: MixedArrayState<T>,
  create: TransformerCreator,
): Observable<ArrayState<T>> {
  const result = new Array(state.length);

  for (let i = 0, len = state.length; i < len; i += 1) {
    if (state[i] instanceof Observable) {
      result[i] = state[i];
      continue;
    }

    result[i] = create(state[i]);
  }

  return of.call(observable, result);
}

function prepareObjectState(
  observable: Observable<MixedObjectState>,
  state: MixedObjectState,
  create: TransformerCreator,
): Observable<ObjectState> {
  const result: ObjectState = {};

  for (const key of Object.keys(state)) {
    if (state[key] instanceof Observable) {
      result[key] = state[key];
      continue;
    }

    result[key] = create(state[key]);
  }

  return of.call(observable, result);
}

function mergeArray<T>(
  observable: Observable<ArrayState<T>>,
  addTrigger: Subject<ArrayAddPayload<T>>,
  removeTrigger: Subject<ArrayRemovePayload>,
  create: TransformerCreator,
): Observable<Reducer<ArrayState<T>>> {
  const addMapped = map.call(
    addTrigger,
    (payload: ArrayAddPayload<T>) => (state: ArrayState<T>) => {
      const element = create(payload);
      state.push(element);

      return state;
    },
  );

  const removeMapped = map.call(
    removeTrigger,
    (payload: ArrayRemovePayload) =>
      (state: ArrayState<T>) =>
        state.filter((_, index) => index !== payload),
  );

  return merge.call(
    observable,
    addMapped,
    removeMapped,
  );
}

function mergeObject(
  observable: Observable<ObjectState>,
  addTrigger: Subject<ObjectAddPayload>,
  removeTrigger: Subject<ObjectRemovePayload>,
  create: TransformerCreator,
): Observable<Reducer<ObjectState>> {
  const addMapped = map.call(
    addTrigger,
    ([key, value]: ObjectAddPayload) => (state: ObjectState) => {
      state[key] = create(value);

      return state;
    },
  );

  const removeMapped = map.call(
    removeTrigger,
    (key: ObjectRemovePayload) => (state: ObjectState) => {
      delete state[key];

      return state;
    },
  );

  return merge.call(
    observable,
    addMapped,
    removeMapped,
  );
}

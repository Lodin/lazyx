import {Observable} from 'rxjs/Observable';
import {letProto} from 'rxjs/operator/let';
import {share} from 'rxjs/operator/share';
import {JSONObject, JSONValue, Middleware, TransformerCreator} from './typings';

export type TransformerInitializer<T> = Observable<T> | TransformerCreator;

export interface InitializersMap {
  [key: string]: InitializersMap | TransformerInitializer<any>;
}

export interface Store {
  getMap(): any;
  add(key: string, initializers: InitializersMap): void;
  merge(initializers: InitializersMap): void;
}

/* tslint:disable:max-line-length unified-signatures */
export default function createStore(initializers: InitializersMap): Store;
export default function createStore(initializers: InitializersMap, preloadedState: JSONValue): Store;
export default function createStore(initializers: InitializersMap, middlewares: Middleware[]): Store;
export default function createStore(initializers: InitializersMap, preloadedState: JSONValue, middlewares: Middleware[]): Store;
/* tslint:enable:max-line-length unified-signatures */

export default function createStore(
  initializers: InitializersMap,
  preloadedState?: JSONValue | Middleware[],
  middlewares?: Middleware[],
): Store {
  if (Array.isArray(preloadedState) && middlewares === undefined) {
    middlewares = <Middleware[]>preloadedState;
    preloadedState = undefined;
  }

  const map = initialize(initializers, <JSONValue | undefined> preloadedState, middlewares);

  const getMap = () => map;

  const add = (key: string, i: InitializersMap) => {
    const state = <JSONValue | undefined> preloadedState && (<JSONObject>preloadedState)[key];
    map[key] = initialize(i, state, middlewares);
  };

  const merge = (i: InitializersMap) => {
    Object.assign(map, initialize(i, <JSONValue | undefined> preloadedState, middlewares));
  };

  return {
    getMap,
    add,
    merge,
  };
}

function decorate<T, U>(transformer: Observable<T>, middlewares?: Middleware[]): Observable<U> {
  const shared = share.call(transformer);

  if (middlewares === undefined) {
    return shared;
  }

  let t = shared;
  for (const middleware of middlewares) {
    t = letProto.call(t, middleware);
  }

  return t;
}

function initialize(map: InitializersMap, state?: JSONValue, middlewares?: Middleware[]): any {
  const result: any = {};

  for (const key of Object.keys(map)) {
    const value = map[key];

    if (typeof value === 'function') {
      result[key] = decorate(value(state && (<JSONObject>state)[key]), middlewares);
    } else if (value instanceof Observable) {
      result[key] = decorate(value, middlewares);
    } else {
      const nestedState = <JSONValue | undefined>(state && (<JSONObject>state)[key]);
      result[key] = initialize(value, nestedState, middlewares);
    }
  }

  return result;
}

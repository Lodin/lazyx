import {Observable} from 'rxjs/Observable';
import {letProto} from 'rxjs/operator/let';
import {share} from 'rxjs/operator/share';
import {JSONObject, Middleware, TransformerCreator} from './typings';

export type Tree = any;

export type TransformerInitializer<T> = Observable<T> | TransformerCreator;

export interface InitializersMap {
  [key: string]: InitializersMap | TransformerInitializer<any>;
}

export interface Store {
  add(key: string, initializers: InitializersMap): void;
  getTree(): Tree;
  merge(initializers: InitializersMap): void;
}

/* tslint:disable:max-line-length unified-signatures */
export default function createStore(initializers: InitializersMap): Store;
export default function createStore(initializers: InitializersMap, preloadedState: JSONObject): Store;
export default function createStore(initializers: InitializersMap, middlewares: Middleware[]): Store;
export default function createStore(initializers: InitializersMap, preloadedState: JSONObject, middlewares: Middleware[]): Store;
/* tslint:enable:max-line-length unified-signatures */

export default function createStore(
  initializers: any,
  preloadedState?: any,
  middlewares?: Middleware[],
): Store {
  if (Array.isArray(preloadedState) && middlewares === undefined) {
    middlewares = <Middleware[]>preloadedState;
    preloadedState = undefined;
  }

  const map = initialize(initializers, preloadedState, middlewares);

  const getTree = () => map;

  const add = (key: string, i: any) => {
    map[key] = initialize(i, preloadedState && preloadedState[key], middlewares);
  };

  const merge = (i: any) => {
    Object.assign(map, initialize(i, preloadedState, middlewares));
  };

  return {
    add,
    getTree,
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

function initialize(map: any, state?: any, middlewares?: Middleware[]): any {
  const result: any = {};

  for (const key of Object.keys(map)) {
    const value = map[key];

    if (typeof value === 'function') {
      result[key] = decorate(value(state && state[key]), middlewares);
    } else if (value instanceof Observable) {
      result[key] = decorate(value, middlewares);
    } else {
      result[key] = initialize(value, state && state[key], middlewares);
    }
  }

  return result;
}

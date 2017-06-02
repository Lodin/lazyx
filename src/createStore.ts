import {Observable} from 'rxjs/Observable';
import {filter} from 'rxjs/operator/filter';
import {letProto} from 'rxjs/operator/let';
import {map} from 'rxjs/operator/map';
import {share} from 'rxjs/operator/share';
import {startWith} from 'rxjs/operator/startWith';
import {JSONObject, Mapper, Middleware, Partial} from './typings';

export interface Store<T> {
  attach(transformers: Partial<T>): void;
  getTree(): T;
}

export type TransformersTree = Mapper<Observable<any>>;

/* tslint:disable:max-line-length unified-signatures */
export default function createStore<T extends TransformersTree>(transformers: Partial<T>): Store<T>;
export default function createStore<T extends TransformersTree>(transformers: Partial<T>, initialState: JSONObject): Store<T>;
export default function createStore<T extends TransformersTree>(transformers: Partial<T>, middlewares: Middleware[]): Store<T>;
export default function createStore<T extends TransformersTree>(transformers: Partial<T>, initialState: JSONObject, middlewares: Middleware[]): Store<T>;
/* tslint:enable:max-line-length unified-signatures */

export default function createStore(transformers: any, initialState?: any, middlewares?: any): any {
  if (Array.isArray(initialState) && middlewares === undefined) {
    middlewares = initialState;
    initialState = undefined;
  }

  const tree = initialize(transformers, initialState, middlewares);

  const getTree = () => tree;

  const attach = (t: any) => {
    Object.assign(tree, initialize(t, initialState, middlewares));
  };

  return {
    attach,
    getTree,
  };
}

function decorate<T, U>(
  transformer: Observable<T>,
  initialState: T|undefined,
  middlewares: Middleware[]|undefined,
  path: string|null,
): Observable<U> {
  const shared = share.call(transformer);

  const initialized = initialState ? (
    filter.call(
      startWith.call(shared, initialState),
      (_: any, index: number) => index !== 1,
    )
  ) : shared;

  if (middlewares === undefined) {
    return initialized;
  }

  let t = map.call(initialized, (value: T) => ({name: path, value}));
  for (const middleware of middlewares) {
    t = letProto.call(t, middleware);
  }

  return t;
}

function initialize(transformers: any, initialState?: any, middlewares?: Middleware[], path: string|null = 'store'): any {
  const result: any = {};

  for (const key of Object.keys(transformers)) {
    const transformer = transformers[key];
    const p = path ? `${path}.${key}` : null;

    if (transformer instanceof Observable) {
      result[key] = decorate(transformer, initialState && initialState[key], middlewares, p);
    } else {
      result[key] = initialize(transformers[key], initialState && initialState[key], middlewares, p);
    }
  }

  return result;
}

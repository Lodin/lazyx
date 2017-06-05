import {Observable} from 'rxjs/Observable';
import {letProto} from 'rxjs/operator/let';
import {map} from 'rxjs/operator/map';
import {share} from 'rxjs/operator/share';
import {JSONObject, Mapper, Middleware, TransformerCreator} from './typings';

export type TransformersMap = Mapper<TransformerCreator | Observable<any>>;

export interface Store {
  attach(transformers: TransformersMap): void;
  getTree(): any;
}

/* tslint:disable:max-line-length unified-signatures */
export default function createStore(transformers: TransformersMap): Store;
export default function createStore(transformers: TransformersMap, initialState: JSONObject): Store;
export default function createStore(transformers: TransformersMap, middlewares: Middleware[]): Store;
export default function createStore(transformers: TransformersMap, initialState: JSONObject, middlewares: Middleware[]): Store;
/* tslint:enable:max-line-length unified-signatures */

export default function createStore(transformers: any, initialState?: any, middlewares?: any): any {
  if (Array.isArray(initialState) && middlewares === undefined) {
    middlewares = initialState;
    initialState = undefined;
  }

  const tree = initialize(transformers, initialState, middlewares);

  const getTree = () => tree;

  const attach = (branch: any) => {
    Object.assign(tree, initialize(branch, initialState, middlewares));
  };

  return {
    attach,
    getTree,
  };
}

function decorate<T, U>(
  transformer: Observable<T>,
  middlewares: Middleware[] | undefined,
  path: string | null,
): Observable<U> {
  const shared = share.call(transformer);

  if (!middlewares) {
    return shared;
  }

  let t = map.call(shared, (value: T) => ({name: path, value}));
  for (const middleware of middlewares) {
    t = letProto.call(t, middleware);
  }

  return t;
}

function initialize(transformers: any, initialState?: any, middlewares?: Middleware[], path: string | null = 'store'): any {
  const result: any = {};

  for (const key of Object.keys(transformers)) {
    const value = transformers[key];
    const p = middlewares ? `${path}.${key}` : null;

    if (typeof value === 'function') {
      result[key] = decorate(value(initialState && initialState[key]), middlewares, p);
    } else if (value instanceof Observable) {
      result[key] = decorate(value, middlewares, p);
    } else {
      result[key] = initialize(value, initialState && initialState[key], middlewares, p);
    }
  }

  return result;
}

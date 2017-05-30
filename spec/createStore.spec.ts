import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';
import createStore from '../src/createStore';

describe('Function "createStore"', () => {
  let initializers: any;
  let middleware: jasmine.Spy;

  beforeEach(() => {
    const t1 = jasmine.createSpy('createTransformer');
    const t2 = Observable.of(5);

    t1.and.returnValue(Observable.of(100));

    initializers = {
      nested1: {
        nested2: t1,
      },
      simple: t2,
    };

    middleware = jasmine.createSpy('middleware');
    middleware.and.returnValue(Observable.of(500));
  });

  it('should create store', () => {
    const store = createStore(initializers);

    expect(<any>store).toEqual({
      add: jasmine.any(Function),
      getTree: jasmine.any(Function),
      merge: jasmine.any(Function),
    });
  });

  describe('with store "getTree" method', () => {
    it('should map initializers to transformers', () => {
      const store = createStore(initializers);
      const tree = store.getTree();

      expect(tree).toEqual({
        nested1: {
          nested2: jasmine.any(Observable),
        },
        simple: jasmine.any(Observable),
      });
    });

    it('should apply preloaded state for initializers', () => {
      const preloadedState = {
        nested1: {
          nested2: 2000,
        },
      };

      createStore(initializers, preloadedState);
      expect(initializers.nested1.nested2).toHaveBeenCalledWith(2000);
    });

    it('should apply middlewares for initializers', () => {
      createStore(initializers, [middleware]);
      expect(middleware).toHaveBeenCalledTimes(2);
      expect(middleware).toHaveBeenCalledWith(jasmine.any(Observable));
    });
  });

  describe('with store "add" method', () => {
    let branch: any;

    beforeEach(() => {
      branch = {
        nested: jasmine.createSpy('branchNested'),
      };

      branch.nested.and.returnValue(Observable.of(30));
    });

    it('should add new transformer branch to the store', () => {
      const store = createStore(initializers);
      store.add('branch', branch);

      const tree = store.getTree();

      expect(tree).toEqual({
        branch: {
          nested: jasmine.any(Observable),
        },
        nested1: {
          nested2: jasmine.any(Observable),
        },
        simple: jasmine.any(Observable),
      });

      expect(branch.nested).toHaveBeenCalledWith(undefined);
    });

    it('should apply preloadedState to newly added transformer branch', () => {
      const preloadedState = {
        branch: {
          nested: 1000,
        },
        nested1: {
          nested2: 5000,
        },
      };

      const store = createStore(initializers, preloadedState);
      expect(initializers.nested1.nested2).toHaveBeenCalledWith(5000);

      store.add('branch', branch);
      expect(branch.nested).toHaveBeenCalledWith(1000);
      expect(branch.nested).toHaveBeenCalledTimes(1);
    });

    it('should apply middleware for newly added transformer branch', () => {
      const store = createStore(initializers, [middleware]);
      store.add('branch', branch);

      expect(middleware).toHaveBeenCalledTimes(3);
    });
  });

  describe('with store "merge" method', () => {
    let part: any;

    beforeEach(() => {
      part = {
        branch1: jasmine.createSpy('partNested'),
      };

      part.branch1.and.returnValue(Observable.of(325));
    });

    it('should merge new store part into the store', () => {
      const store = createStore(initializers);
      store.merge(part);

      const tree = store.getTree();

      expect(tree).toEqual({
        branch1: jasmine.any(Observable),
        nested1: {
          nested2: jasmine.any(Observable),
        },
        simple: jasmine.any(Observable),
      });

      expect(part.branch1).toHaveBeenCalledWith(undefined);
    });

    it('should apply preloadedState to newly merged part', () => {
      const preloadedState = {
        branch1: 999,
        nested1: {
          nested2: 888,
        },
      };

      const store = createStore(initializers, preloadedState);
      expect(initializers.nested1.nested2).toHaveBeenCalledWith(888);

      store.merge(part);
      expect(part.branch1).toHaveBeenCalledWith(999);
      expect(part.branch1).toHaveBeenCalledTimes(1);
    });

    it('should apply middleware to newly merged part', () => {
      const store = createStore(initializers, [middleware]);
      store.merge(part);

      expect(middleware).toHaveBeenCalledTimes(3);
    });
  });
});

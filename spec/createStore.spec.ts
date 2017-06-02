import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import {Observable} from 'rxjs/Observable';
import createStore from '../src/createStore';

type Transformers = {
  nested1: {
    nested2: Observable<number>;
  };
  simple: Observable<number>;
};

type Branch = {
  los1: {
    los2: Observable<string>;
  };
};

describe('Function "createStore"', () => {
  let transformers: Transformers;
  let middleware: jasmine.Spy;
  let middlewareHelper: jasmine.Spy;

  beforeEach(() => {
    transformers = {
      nested1: {
        nested2: Observable.of(100),
      },
      simple: Observable.of(1),
    };

    middleware = jasmine.createSpy('middleware');
    middlewareHelper = jasmine.createSpy('middlewareHelper');

    middleware.and.callFake(<T>(t: Observable<T>) => t.do(middlewareHelper));
  });

  it('should create store', () => {
    const store = createStore<Transformers>(transformers);

    expect(<any>store).toEqual({
      attach: jasmine.any(Function),
      getTree: jasmine.any(Function),
    });
  });

  describe('using store "getTree" method', () => {
    it('should initialize transformers', (done) => {
      const store = createStore<Transformers>(transformers);
      const tree = store.getTree();

      expect(<any>tree).toEqual({
        nested1: {
          nested2: jasmine.any(Observable),
        },
        simple: jasmine.any(Observable),
      });

      Observable.combineLatest(tree.nested1.nested2, tree.simple)
        .subscribe(([first, second]: [number, number]) => {
          expect(first).toBe(100);
          expect(second).toBe(1);
          done();
        });
    });

    it('should initialize transformers with initial state', (done) => {
      const initialState = {
        nested1: {
          nested2: 5000,
        },
        simple: 1000,
      };

      const tree = createStore<Transformers>(transformers, initialState).getTree();

      Observable.combineLatest(tree.nested1.nested2, tree.simple)
        .subscribe(([first, second]: [number, number]) => {
          expect(first).toBe(5000);
          expect(second).toBe(1000);
          done();
        });
    });

    it('should initialize transformers with middlewares', () => {
      createStore<Transformers>(transformers, [middleware]);

      expect(middleware).toHaveBeenCalledTimes(2);
      expect(middleware).toHaveBeenCalledWith(jasmine.any(Observable));
    });

    it('should send transformer path to the middleware', (done) => {
      const tree = createStore<Transformers>(transformers, [middleware]).getTree();

      Observable.combineLatest(tree.nested1.nested2, tree.simple)
        .subscribe(() => {
          expect(middlewareHelper).toHaveBeenCalledTimes(2);
          expect(middlewareHelper).toHaveBeenCalledWith({
            name: 'store.nested1.nested2',
            value: 100,
          });
          expect(middlewareHelper).toHaveBeenCalledWith({
            name: 'store.simple',
            value: 1,
          });

          done();
        });
    });
  });

  describe('using store "attach" method', () => {
    let branch: Branch;

    beforeEach(() => {
      branch = {
        los1: {
          los2: Observable.of('test'),
        },
      };
    });

    it('should add new branch to store', (done) => {
      const store = createStore<Transformers & Branch>(transformers);
      store.attach(branch);

      const tree = store.getTree();

      expect(<any>tree).toEqual({
        los1: {
          los2: jasmine.any(Observable),
        },
        nested1: {
          nested2: jasmine.any(Observable),
        },
        simple: jasmine.any(Observable),
      });

      Observable.combineLatest(tree.nested1.nested2, tree.simple, tree.los1.los2)
        .subscribe(([first, second, third]: [number, number, string]) => {
          expect(first).toBe(100);
          expect(second).toBe(1);
          expect(third).toBe('test');
          done();
        });
    });

    it('should apply initialState to the new branch', (done) => {
      const initialState = {
        los1: {
          los2: 'anotherTest',
        },
        nested1: {
          nested2: 1000,
        },
        simple: 2000,
      };

      const store = createStore<Transformers & Branch>(transformers, initialState);
      store.attach(branch);

      const tree = store.getTree();

      Observable.combineLatest(tree.nested1.nested2, tree.simple, tree.los1.los2)
        .subscribe(([first, second, third]: [number, number, string]) => {
          expect(first).toBe(1000);
          expect(second).toBe(2000);
          expect(third).toBe('anotherTest');
          done();
        });
    });

    it('should apply middlewares to the new branch', () => {
      const store = createStore<Transformers & Branch>(transformers, [middleware]);

      expect(middleware).toHaveBeenCalledTimes(2);

      store.attach(branch);

      expect(middleware).toHaveBeenCalledTimes(3);
    });
  });
});

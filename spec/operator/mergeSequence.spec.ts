import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/scan';
import 'rxjs/add/operator/skip';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import '../../src/add/operator/mergeSequence';
import {Reducer} from '../../src/typings';

describe('Operator "mergeSequence"', () => {
  let create: jasmine.Spy;

  beforeEach(() => {
    create = jasmine.createSpy('create');
    create.and.returnValue(Observable.of('str'));
  });

  it('should throw an error if input value is not array nor plain object', () => {
    const addTrigger = new Subject();
    const removeTrigger = new Subject();

    const transformer = (<any>Observable.of(0))
      .mergeSequence(addTrigger, removeTrigger, create)
      .scan((state: number, reducer: Reducer<number>) => reducer(state));

    expect(() => transformer.subscribe((x: number) => x))
      .toThrow(new TypeError('Observable value for "mergeSequence" should be an array or a plain object'));
  });

  describe('with array input', () => {
    let addTrigger: Subject<string>;
    let removeTrigger: Subject<number>;

    beforeEach(() => {
      addTrigger = new Subject();
      removeTrigger = new Subject();
    });

    describe('(basics)', () => {
      let transformer: Observable<Observable<string>[]>;

      beforeEach(() => {
        transformer = Observable.of([])
          .mergeSequence(addTrigger, removeTrigger, create)
          .scan((state: Observable<string>[], reducer) => reducer(state));
      });

      it('should add new observable element to the transformer state', (done) => {
        transformer.skip(1).subscribe((value) => {
          expect(value.length).toBe(1);
          expect(value[0]).toEqual(jasmine.any(Observable));
          expect(create).toHaveBeenCalledWith('test');

          done();
        });

        addTrigger.next('test');
      });

      it('should remove observable element by index from the transformer state', (done) => {
        transformer.skip(2).subscribe((value) => {
          expect(value.length).toBe(0);
          done();
        });

        addTrigger.next('test');
        removeTrigger.next(0);
      });
    });

    describe('(advanced)', () => {
      beforeEach(() => {
        create.and.callFake((state: string) => Observable.of(state));
      });

      it('should transform initial state to sequence of observables', (done) => {
        Observable.of(['1', '2', '3'])
          .mergeSequence(addTrigger, removeTrigger, create)
          .scan((state: Observable<string>[], reducer) => reducer(state))
          .do((sequence) => {
            expect(sequence).toEqual([jasmine.any(Observable), jasmine.any(Observable), jasmine.any(Observable)]);
          })
          .mergeMap(([one, two, three]) => Observable.combineLatest(one, two, three))
          .subscribe((sequence) => {
            expect(sequence).toEqual(['1', '2', '3']);
            done();
          });
      });

      it('should skip elements of initial state if they are already observables', (done) => {
        Observable.of(['1', Observable.of('2'), '3'])
          .mergeSequence(addTrigger, removeTrigger, create)
          .scan((state: Observable<string>[], reducer) => reducer(state))
          .mergeMap(([one, two, three]) => Observable.combineLatest(one, two, three))
          .subscribe((sequence) => {
            expect(sequence).toEqual(['1', '2', '3']);
            done();
          });
      });
    });
  });

  describe('with object input', () => {
    let addTrigger: Subject<[string, any]>;
    let removeTrigger: Subject<string>;

    beforeEach(() => {
      addTrigger = new Subject();
      removeTrigger = new Subject();
    });

    describe('(basics)', () => {
      let transformer: Observable<{ [key: string]: Observable<any> }>;

      beforeEach(() => {
        transformer = Observable.of({})
          .mergeSequence(addTrigger, removeTrigger, create)
          .scan((state: { [key: string]: Observable<any> }, reducer) => reducer(state));
      });

      it('should add new observable element with key to the transformer state', (done) => {
        transformer.skip(1).subscribe((value) => {
          expect(Object.keys(value).length).toBe(1);
          expect(value.test).toEqual(jasmine.any(Observable));
          expect(create).toHaveBeenCalledWith('init');

          done();
        });

        addTrigger.next(['test', 'init']);
      });

      it('should remove observable element by key from the transformer state', (done) => {
        transformer.skip(2).subscribe((value) => {
          expect(Object.keys(value).length).toBe(0);
          done();
        });

        addTrigger.next(['test', 'init']);
        removeTrigger.next('test');
      });
    });

    describe('(advanced)', () => {
      beforeEach(() => {
        create.and.callFake((state: string) => Observable.of(state));
      });

      it('should transform initial state to sequence of observables', (done) => {
        Observable.of({a: '1', b: '2', c: '3'})
          .mergeSequence(addTrigger, removeTrigger, create)
          .scan((state: Observable<string>[], reducer) => reducer(state))
          .do((sequence) => {
            expect(sequence).toEqual({
              a: jasmine.any(Observable),
              b: jasmine.any(Observable),
              c: jasmine.any(Observable),
            });
          })
          .mergeMap(({a, b, c}) => Observable.combineLatest(a, b, c, (aa, bb, cc) => ({a: aa, b: bb, c: cc})))
          .subscribe((sequence) => {
            expect(sequence).toEqual({a: '1', b: '2', c: '3'});
            done();
          });
      });

      it('should skip elements of initial state if they are already observables', (done) => {
        Observable.of({a: '1', b: Observable.of('2'), c: '3'})
          .mergeSequence(addTrigger, removeTrigger, create)
          .scan((state: Observable<string>[], reducer) => reducer(state))
          .do((sequence) => {
            expect(sequence).toEqual({
              a: jasmine.any(Observable),
              b: jasmine.any(Observable),
              c: jasmine.any(Observable),
            });
          })
          .mergeMap(({a, b, c}) => Observable.combineLatest(a, b, c, (aa, bb, cc) => ({a: aa, b: bb, c: cc})))
          .subscribe((sequence) => {
            expect(sequence).toEqual({a: '1', b: '2', c: '3'});
            done();
          });
      });
    });
  });
});

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/skip';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import '../../src/add/operator/apply';

describe('Operator "apply"', () => {
  let trigger: Subject<number>;
  let transformer: Observable<number>;

  beforeEach(() => {
    trigger = new Subject();
    transformer = Observable.of(0)
      .merge(
        trigger.map((payload: number) => (state: number) => state + payload),
      )
      .apply();
  });

  it('should change state on every trigger', (done) => {
    transformer.skip(2).subscribe((value) => {
      expect(value).toBe(50);
      done();
    });

    trigger.next(10);
    trigger.next(40);
  });
});

import {Subject} from 'rxjs/Subject';
import {SubjectMap} from '../src/SubjectMap';

describe('Class "SubjectMap"', () => {
  const keys = (m: SubjectMap<string>) => Array.from((<any>m).subjects.keys());

  let map: SubjectMap<string>;

  beforeEach(() => {
    map = new SubjectMap<string>();
  });

  it('should create instance with predefined ids', () => {
    const ids = ['test1', 'test2'];
    const subjectMap = new SubjectMap(ids);

    expect(keys(subjectMap)).toEqual(ids);
  });

  it('if has no subject by this id, should create one and return it', () => {
    expect(keys(map).length).toBe(0);

    const subject = map.get('subj');
    expect(subject).toEqual(jasmine.any(Subject));
  });

  it('should get already created subject if there is existing one', () => {
    const subject1 = map.get('equal');
    const subject2 = map.get('equal');

    expect(subject1).toBe(subject2);
  });

  it('should remove existing subject', () => {
    map.get('remove');
    expect(keys(map).length).not.toBe(0);

    map.remove('remove');
    expect(keys(map).length).toBe(0);
  });
});

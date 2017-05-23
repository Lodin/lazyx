import {Subject} from 'rxjs/Subject';

export class SubjectMap<T> {
  private subjects = new Map<T, Subject<any>>();

  public constructor(ids?: T[]) {
    if (ids === undefined) {
      return;
    }

    for (const id of ids) {
      this.subjects.set(id, new Subject());
    }
  }

  public get(id: T): Subject<any> {
    if (!this.subjects.has(id)) {
      const subject = new Subject();
      this.subjects.set(id, subject);

      return subject;
    }

    return <Subject<any>>this.subjects.get(id);
  }

  public remove(id: T): boolean {
    return this.subjects.delete(id);
  }
}

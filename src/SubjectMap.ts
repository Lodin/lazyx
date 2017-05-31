import {Subject} from 'rxjs/Subject';

export class SubjectMap<T, U> {
  private subjects = new Map<T, Subject<U>>();

  public constructor(ids?: T[]) {
    if (ids === undefined) {
      return;
    }

    for (const id of ids) {
      this.subjects.set(id, new Subject<U>());
    }
  }

  public get(id: T): Subject<U> {
    if (!this.subjects.has(id)) {
      const subject = new Subject<U>();
      this.subjects.set(id, subject);

      return subject;
    }

    return <Subject<U>>this.subjects.get(id);
  }

  public remove(id: T): boolean {
    return this.subjects.delete(id);
  }
}

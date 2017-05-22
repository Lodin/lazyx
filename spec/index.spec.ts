import {Student} from '../src';

describe('Class "Student"', () => {
  it('should create full name', () => {
    const student = new Student('Jane', 'M.', 'Doe');
    expect(student.fullName).toEqual('Jane M. Doe');
  });

  it('should fail', () => {
    const student = new Student('Jane', 'M.', 'Doe');
    expect(student.fullName).toEqual('Jane M.');
  });

  xit('pending', () => {
    const student = new Student('Jane', 'M.', 'Doe');
    expect(student.fullName).toEqual('Jane M. Doe');
  });
});

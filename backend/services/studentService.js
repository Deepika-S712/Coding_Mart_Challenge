const studentRepository = require('../repositories/studentRepository');

class StudentService {
  async getStudentsForFaculty(faculty, filters = {}) {
    const allStudents = await studentRepository.getAll(filters);
    // Faculty can access students in their assigned classes or enrolled in their subjects
    const authorizedStudents = allStudents.filter(s => 
      faculty.assignedClasses.includes(s.className) ||
      (s.enrolledSubjects && s.enrolledSubjects.some(sub => faculty.assignedSubjects.includes(sub)))
    );
    return authorizedStudents;
  }

  async getStudentById(faculty, id) {
    const student = await studentRepository.getById(id);
    if (!student) return null;

    const isAuthorized = faculty.assignedClasses.includes(student.className) ||
      (student.enrolledSubjects && student.enrolledSubjects.some(sub => faculty.assignedSubjects.includes(sub)));

    if (!isAuthorized) {
      const error = new Error('Unauthorized to view this student');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    return student;
  }

  async createStudent(faculty, data) {
    if (!faculty.assignedClasses.includes(data.className)) {
      const error = new Error(`Cannot add student to class ${data.className} not assigned to you`);
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }
    return await studentRepository.create(data);
  }

  async updateStudent(faculty, id, data) {
    const existing = await this.getStudentById(faculty, id);
    if (!existing) {
      const error = new Error('Student not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return await studentRepository.update(id, data);
  }

  async deleteStudent(faculty, id) {
    await this.getStudentById(faculty, id);
    return await studentRepository.delete(id);
  }
}

module.exports = new StudentService();

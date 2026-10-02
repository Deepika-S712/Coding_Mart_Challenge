const studentService = require('../services/studentService');
const ResponseDto = require('../dto/responseDto');

class StudentController {
  async getAll(req, res, next) {
    try {
      const { search, className, semester } = req.query;
      const students = await studentService.getStudentsForFaculty(req.user, { search, className, semester });
      return ResponseDto.success(res, students, 'Students retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.user, req.params.id);
      if (!student) {
        return ResponseDto.error(res, 'Student not found', 'NOT_FOUND', 404);
      }
      return ResponseDto.success(res, student, 'Student details retrieved successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const newStudent = await studentService.createStudent(req.user, req.body);
      return ResponseDto.success(res, newStudent, 'Student created successfully', 201);
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await studentService.updateStudent(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Student updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await studentService.deleteStudent(req.user, req.params.id);
      return ResponseDto.success(res, null, 'Student deleted successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new StudentController();

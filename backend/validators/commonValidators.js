const ResponseDto = require('../dto/responseDto');

function validateStudentInput(req, res, next) {
  const { name, rollNumber, className, email } = req.body || {};
  if (!name || !name.trim()) {
    return ResponseDto.error(res, 'Student name is required', 'VALIDATION_ERROR', 400);
  }
  if (!rollNumber || !rollNumber.trim()) {
    return ResponseDto.error(res, 'Roll number is required', 'VALIDATION_ERROR', 400);
  }
  if (!className || !className.trim()) {
    return ResponseDto.error(res, 'Class name is required', 'VALIDATION_ERROR', 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return ResponseDto.error(res, 'Invalid student email format', 'VALIDATION_ERROR', 400);
  }
  next();
}

function validateAttendanceInput(req, res, next) {
  const { date, subjectCode, className, records } = req.body || {};
  if (!date) {
    return ResponseDto.error(res, 'Date is required', 'VALIDATION_ERROR', 400);
  }
  if (!subjectCode) {
    return ResponseDto.error(res, 'Subject code is required', 'VALIDATION_ERROR', 400);
  }
  if (!className) {
    return ResponseDto.error(res, 'Class name is required', 'VALIDATION_ERROR', 400);
  }
  if (!Array.isArray(records) || records.length === 0) {
    return ResponseDto.error(res, 'Attendance records must be an array with at least one student', 'VALIDATION_ERROR', 400);
  }
  next();
}

function validateAssignmentInput(req, res, next) {
  const { title, subjectCode, className, dueDate } = req.body || {};
  if (!title || !title.trim()) {
    return ResponseDto.error(res, 'Assignment title is required', 'VALIDATION_ERROR', 400);
  }
  if (!subjectCode) {
    return ResponseDto.error(res, 'Subject code is required', 'VALIDATION_ERROR', 400);
  }
  if (!className) {
    return ResponseDto.error(res, 'Class name is required', 'VALIDATION_ERROR', 400);
  }
  if (!dueDate) {
    return ResponseDto.error(res, 'Due date is required', 'VALIDATION_ERROR', 400);
  }
  next();
}

function validateAssessmentInput(req, res, next) {
  const { title, subjectCode, className, date, maxMarks } = req.body || {};
  if (!title || !title.trim()) {
    return ResponseDto.error(res, 'Assessment title is required', 'VALIDATION_ERROR', 400);
  }
  if (!subjectCode) {
    return ResponseDto.error(res, 'Subject code is required', 'VALIDATION_ERROR', 400);
  }
  if (!className) {
    return ResponseDto.error(res, 'Class name is required', 'VALIDATION_ERROR', 400);
  }
  if (!date) {
    return ResponseDto.error(res, 'Assessment date is required', 'VALIDATION_ERROR', 400);
  }
  if (!maxMarks || Number(maxMarks) <= 0) {
    return ResponseDto.error(res, 'Maximum marks must be a positive number', 'VALIDATION_ERROR', 400);
  }
  next();
}

function validateContentInput(req, res, next) {
  const { title, topic, subjectCode, contentType } = req.body || {};
  if (!title || !title.trim()) {
    return ResponseDto.error(res, 'Content title is required', 'VALIDATION_ERROR', 400);
  }
  if (!topic || !topic.trim()) {
    return ResponseDto.error(res, 'Topic name is required', 'VALIDATION_ERROR', 400);
  }
  if (!subjectCode) {
    return ResponseDto.error(res, 'Subject code is required', 'VALIDATION_ERROR', 400);
  }
  if (!contentType) {
    return ResponseDto.error(res, 'Content type is required', 'VALIDATION_ERROR', 400);
  }
  next();
}

function validateTimetableInput(req, res, next) {
  if (req.method === 'POST') {
    const { dayOfWeek, startTime, endTime, subjectCode, className, room } = req.body || {};
    if (!dayOfWeek || !startTime || !endTime || !subjectCode || !className || !room) {
      return ResponseDto.error(res, 'All timetable schedule fields are required', 'VALIDATION_ERROR', 400);
    }
  } else if (req.method === 'PUT') {
    if (!req.body || Object.keys(req.body).length === 0) {
      return ResponseDto.error(res, 'At least one field is required to update schedule', 'VALIDATION_ERROR', 400);
    }
  }
  next();
}

function validateNoticeInput(req, res, next) {
  const { title, content, category } = req.body || {};
  if (!title || !title.trim()) {
    return ResponseDto.error(res, 'Notice title is required', 'VALIDATION_ERROR', 400);
  }
  if (!content || !content.trim()) {
    return ResponseDto.error(res, 'Notice content is required', 'VALIDATION_ERROR', 400);
  }
  if (!category) {
    return ResponseDto.error(res, 'Notice category is required', 'VALIDATION_ERROR', 400);
  }
  next();
}

module.exports = {
  validateStudentInput,
  validateAttendanceInput,
  validateAssignmentInput,
  validateAssessmentInput,
  validateContentInput,
  validateTimetableInput,
  validateNoticeInput
};

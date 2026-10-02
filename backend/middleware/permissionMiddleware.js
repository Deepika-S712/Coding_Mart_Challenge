const ResponseDto = require('../dto/responseDto');

function verifySubjectOwnership(req, res, next) {
  const user = req.user;
  const requestedSubject = req.params.subjectCode || req.query.subjectCode || req.body.subjectCode;

  if (requestedSubject && !user.assignedSubjects.includes(requestedSubject)) {
    return ResponseDto.error(res, 'You are not assigned to manage this subject', 'FORBIDDEN_RESOURCE', 403);
  }
  next();
}

function verifyClassOwnership(req, res, next) {
  const user = req.user;
  const requestedClass = req.params.className || req.query.className || req.body.className;

  if (requestedClass && !user.assignedClasses.includes(requestedClass)) {
    return ResponseDto.error(res, 'You are not authorized to access this class', 'FORBIDDEN_RESOURCE', 403);
  }
  next();
}

module.exports = {
  verifySubjectOwnership,
  verifyClassOwnership
};

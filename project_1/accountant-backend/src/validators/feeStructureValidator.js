const { errorResponse } = require('../utils/responseHelper');

const validateFeeStructure = (req, res, next) => {
  const {
    academic_year,
    department,
    year,
    semester,
    tuition_fee,
    exam_fee,
    library_fee,
    transport_fee,
    hostel_fee,
    other_fee
  } = req.body;

  const errors = [];

  if (!academic_year || typeof academic_year !== 'string' || !academic_year.trim()) {
    errors.push('Academic year is required (e.g. "2026-2027").');
  }

  if (!department || typeof department !== 'string' || !department.trim()) {
    errors.push('Department is required.');
  }

  const numYear = parseInt(year, 10);
  if (isNaN(numYear) || numYear < 1 || numYear > 5) {
    errors.push('Year must be an integer between 1 and 5.');
  }

  const numSemester = parseInt(semester, 10);
  if (isNaN(numSemester) || numSemester < 1 || numSemester > 10) {
    errors.push('Semester must be an integer between 1 and 10.');
  }

  const feeFields = {
    tuition_fee,
    exam_fee,
    library_fee,
    transport_fee,
    hostel_fee,
    other_fee
  };

  for (const [key, val] of Object.entries(feeFields)) {
    if (val !== undefined && val !== null && val !== '') {
      const numVal = parseFloat(val);
      if (isNaN(numVal) || numVal < 0) {
        errors.push(`${key.replace('_', ' ')} cannot be negative.`);
      }
    }
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Validation failed for Fee Structure.', 400, errors);
  }

  next();
};

module.exports = { validateFeeStructure };

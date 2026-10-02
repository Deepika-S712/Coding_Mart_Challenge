const { facultyData, subjectsData } = require('../mock-data/facultyData');

class FacultyRepository {
  constructor() {
    this.facultyList = [...facultyData];
    this.subjects = [...subjectsData];
  }

  async findByEmail(email) {
    return this.facultyList.find(f => f.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id) {
    return this.facultyList.find(f => f.id === id) || null;
  }

  async updateProfile(id, updateData) {
    const index = this.facultyList.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.facultyList[index] = { ...this.facultyList[index], ...updateData };
    return this.facultyList[index];
  }

  async getSubjectsByFaculty(facultyId) {
    return this.subjects.filter(s => s.assignedFacultyId === facultyId);
  }

  async findSubjectByCode(code) {
    return this.subjects.find(s => s.code === code) || null;
  }
}

module.exports = new FacultyRepository();

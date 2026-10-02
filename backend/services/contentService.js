const contentRepository = require('../repositories/contentRepository');

class ContentService {
  async getContent(faculty, filters = {}) {
    return await contentRepository.getAll({
      facultyId: faculty.id,
      ...filters
    });
  }

  async getContentById(faculty, id) {
    const item = await contentRepository.getById(id);
    if (!item || item.facultyId !== faculty.id) {
      const error = new Error('Subject content not found or unauthorized');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async addContent(faculty, data) {
    if (!faculty.assignedSubjects.includes(data.subjectCode)) {
      const error = new Error('You are not authorized to upload content for this subject');
      error.code = 'FORBIDDEN_RESOURCE';
      error.statusCode = 403;
      throw error;
    }

    return await contentRepository.create({
      facultyId: faculty.id,
      ...data
    });
  }

  async updateContent(faculty, id, data) {
    await this.getContentById(faculty, id);
    return await contentRepository.update(id, data);
  }

  async deleteContent(faculty, id) {
    await this.getContentById(faculty, id);
    return await contentRepository.delete(id);
  }
}

module.exports = new ContentService();

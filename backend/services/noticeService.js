const noticeRepository = require('../repositories/noticeRepository');

class NoticeService {
  async getNotices(filters = {}) {
    return await noticeRepository.getAll(filters);
  }

  async getNoticeById(id) {
    const item = await noticeRepository.getById(id);
    if (!item) {
      const error = new Error('Notice not found');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return item;
  }

  async createNotice(faculty, data) {
    return await noticeRepository.create({
      facultyId: faculty.id,
      authorName: `Dr. ${faculty.name}`,
      ...data
    });
  }

  async updateNotice(faculty, id, data) {
    await this.getNoticeById(id);
    return await noticeRepository.update(id, data);
  }

  async deleteNotice(faculty, id) {
    await this.getNoticeById(id);
    return await noticeRepository.delete(id);
  }
}

module.exports = new NoticeService();

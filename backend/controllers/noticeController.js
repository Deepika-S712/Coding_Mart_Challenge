const noticeService = require('../services/noticeService');
const ResponseDto = require('../dto/responseDto');

class NoticeController {
  async getAll(req, res, next) {
    try {
      const { search, category } = req.query;
      const notices = await noticeService.getNotices({ search, category });
      return ResponseDto.success(res, notices, 'Notices retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const notice = await noticeService.getNoticeById(req.params.id);
      return ResponseDto.success(res, notice, 'Notice details retrieved');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await noticeService.createNotice(req.user, req.body);
      return ResponseDto.success(res, created, 'Notice published successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await noticeService.updateNotice(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Notice updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await noticeService.deleteNotice(req.user, req.params.id);
      return ResponseDto.success(res, null, 'Notice deleted successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new NoticeController();

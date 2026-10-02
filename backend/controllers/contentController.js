const contentService = require('../services/contentService');
const ResponseDto = require('../dto/responseDto');

class ContentController {
  async getAll(req, res, next) {
    try {
      const { subjectCode, contentType, search } = req.query;
      const content = await contentService.getContent(req.user, { subjectCode, contentType, search });
      return ResponseDto.success(res, content, 'Subject content retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const item = await contentService.getContentById(req.user, req.params.id);
      return ResponseDto.success(res, item, 'Content item retrieved');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const created = await contentService.addContent(req.user, req.body);
      return ResponseDto.success(res, created, 'Content uploaded successfully', 201);
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await contentService.updateContent(req.user, req.params.id, req.body);
      return ResponseDto.success(res, updated, 'Content updated successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await contentService.deleteContent(req.user, req.params.id);
      return ResponseDto.success(res, null, 'Content deleted successfully');
    } catch (err) {
      if (err.statusCode) {
        return ResponseDto.error(res, err.message, err.code, err.statusCode);
      }
      next(err);
    }
  }
}

module.exports = new ContentController();

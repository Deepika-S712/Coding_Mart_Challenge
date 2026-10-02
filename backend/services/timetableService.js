const timetableRepository = require('../repositories/timetableRepository');
const { subjectsData } = require('../mock-data/facultyData');

class TimetableService {
  async getWeeklyTimetable(faculty) {
    return await timetableRepository.getAll(faculty.id);
  }

  async getTodayClasses(faculty) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[new Date().getDay()];
    // If today is weekend, provide Monday's schedule for preview/demo convenience
    const targetDay = (currentDay === 'Sunday' || currentDay === 'Saturday') ? 'Monday' : currentDay;
    return await timetableRepository.getTodayClasses(faculty.id, targetDay);
  }

  async addSchedule(faculty, data) {
    const subjectInfo = subjectsData.find(s => s.code === data.subjectCode);
    const subjectName = data.subjectName || (subjectInfo ? subjectInfo.name : data.subjectCode);
    return await timetableRepository.create({
      facultyId: faculty.id,
      subjectName,
      ...data
    });
  }

  async updateSchedule(faculty, id, data) {
    const existing = await timetableRepository.getById(id);
    if (!existing || existing.facultyId !== faculty.id) {
      const error = new Error('Timetable entry not found or unauthorized');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    const updatePayload = { ...data };
    if (data.subjectCode && !data.subjectName) {
      const subjectInfo = subjectsData.find(s => s.code === data.subjectCode);
      if (subjectInfo) {
        updatePayload.subjectName = subjectInfo.name;
      }
    }
    return await timetableRepository.update(id, updatePayload);
  }

  async deleteSchedule(faculty, id) {
    const existing = await timetableRepository.getById(id);
    if (!existing || existing.facultyId !== faculty.id) {
      const error = new Error('Timetable entry not found or unauthorized');
      error.code = 'NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    return await timetableRepository.delete(id);
  }
}

module.exports = new TimetableService();

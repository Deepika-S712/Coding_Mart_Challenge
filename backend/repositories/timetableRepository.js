const { timetableData } = require('../mock-data/timetableData');

class TimetableRepository {
  constructor() {
    this.schedules = [...timetableData];
  }

  async getAll(facultyId) {
    return this.schedules.filter(s => s.facultyId === facultyId);
  }

  async getTodayClasses(facultyId, dayOfWeek) {
    return this.schedules.filter(s => s.facultyId === facultyId && s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());
  }

  async getById(id) {
    return this.schedules.find(s => s.id === id) || null;
  }

  async create(scheduleData) {
    const newSchedule = {
      id: `TT${String(this.schedules.length + 1).padStart(3, '0')}`,
      status: scheduleData.status || 'Scheduled',
      ...scheduleData
    };
    this.schedules.push(newSchedule);
    return newSchedule;
  }

  async update(id, scheduleData) {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.schedules[index] = { ...this.schedules[index], ...scheduleData };
    return this.schedules[index];
  }

  async delete(id) {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.schedules.splice(index, 1);
    return true;
  }
}

module.exports = new TimetableRepository();

import { timetableSlots } from '../data/timetable.js';

export const timetableRepository = {
  getAll({ facultyId, classVal, day } = {}) {
    let result = [...timetableSlots];
    if (facultyId) result = result.filter(t => t.facultyId === facultyId);
    if (classVal) result = result.filter(t => t.class === classVal);
    if (day) result = result.filter(t => t.day.toLowerCase() === day.toLowerCase());
    return result;
  },

  findById(id) {
    return timetableSlots.find(t => t.id === id);
  },

  create(slotData) {
    const id = `TT${String(timetableSlots.length + 1).padStart(3, '0')}`;
    const newSlot = {
      id,
      ...slotData
    };
    timetableSlots.push(newSlot);
    return newSlot;
  },

  update(id, updates) {
    const index = timetableSlots.findIndex(t => t.id === id);
    if (index === -1) return null;
    timetableSlots[index] = { ...timetableSlots[index], ...updates };
    return timetableSlots[index];
  },

  delete(id) {
    const index = timetableSlots.findIndex(t => t.id === id);
    if (index === -1) return false;
    timetableSlots.splice(index, 1);
    return true;
  }
};

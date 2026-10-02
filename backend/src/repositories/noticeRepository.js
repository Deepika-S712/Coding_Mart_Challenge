import { notices, announcements } from '../data/announcements.js';

export const noticeRepository = {
  getAllNotices({ facultyId, category, search } = {}) {
    let result = [...notices];
    if (facultyId) result = result.filter(n => n.facultyId === facultyId);
    if (category) result = result.filter(n => n.category.toLowerCase() === category.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    }
    // Sort pinned notices first, then date descending
    result.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    return result;
  },

  getAllAnnouncements({ category, search } = {}) {
    let result = [...announcements];
    if (category) result = result.filter(a => a.category.toLowerCase() === category.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return result;
  },

  findNoticeById(id) {
    return notices.find(n => n.id === id);
  },

  createNotice(data) {
    const id = `NOT${String(notices.length + 1).padStart(3, '0')}`;
    const newNotice = {
      id,
      date: new Date().toISOString().split('T')[0],
      isPinned: !!data.isPinned,
      priority: data.priority || "Normal",
      ...data
    };
    notices.unshift(newNotice);
    return newNotice;
  },

  updateNotice(id, updates) {
    const index = notices.findIndex(n => n.id === id);
    if (index === -1) return null;
    notices[index] = { ...notices[index], ...updates };
    return notices[index];
  },

  togglePin(id) {
    const notice = notices.find(n => n.id === id);
    if (!notice) return null;
    notice.isPinned = !notice.isPinned;
    return notice;
  },

  deleteNotice(id) {
    const index = notices.findIndex(n => n.id === id);
    if (index === -1) return false;
    notices.splice(index, 1);
    return true;
  }
};

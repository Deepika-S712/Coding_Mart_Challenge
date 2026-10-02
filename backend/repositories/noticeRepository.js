const { noticesData } = require('../mock-data/noticesData');

class NoticeRepository {
  constructor() {
    this.notices = [...noticesData];
  }

  async getAll({ search = '', category = '' } = {}) {
    let result = [...this.notices];

    if (category) {
      result = result.filter(n => n.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.targetAudience.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.publishDate) - new Date(a.publishDate));
  }

  async getById(id) {
    return this.notices.find(n => n.id === id) || null;
  }

  async create(data) {
    const newItem = {
      id: `NTC${String(this.notices.length + 1).padStart(3, '0')}`,
      publishDate: new Date().toISOString().split('T')[0],
      pinned: !!data.pinned,
      priority: data.priority || 'Normal',
      ...data
    };
    this.notices.unshift(newItem);
    return newItem;
  }

  async update(id, data) {
    const index = this.notices.findIndex(n => n.id === id);
    if (index === -1) return null;
    this.notices[index] = { ...this.notices[index], ...data };
    return this.notices[index];
  }

  async delete(id) {
    const index = this.notices.findIndex(n => n.id === id);
    if (index === -1) return false;
    this.notices.splice(index, 1);
    return true;
  }
}

module.exports = new NoticeRepository();

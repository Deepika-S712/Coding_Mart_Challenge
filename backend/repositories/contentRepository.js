const { contentData } = require('../mock-data/contentData');

class ContentRepository {
  constructor() {
    this.contents = [...contentData];
  }

  async getAll({ facultyId, subjectCode = '', contentType = '', search = '' } = {}) {
    let result = this.contents.filter(c => c.facultyId === facultyId);

    if (subjectCode) {
      result = result.filter(c => c.subjectCode === subjectCode);
    }
    if (contentType) {
      result = result.filter(c => c.contentType.toLowerCase() === contentType.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
  }

  async getById(id) {
    return this.contents.find(c => c.id === id) || null;
  }

  async create(itemData) {
    const newItem = {
      id: `CNT${String(this.contents.length + 1).padStart(3, '0')}`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: itemData.fileSize || '1.2 MB',
      tags: itemData.tags || [],
      ...itemData
    };
    this.contents.unshift(newItem);
    return newItem;
  }

  async update(id, itemData) {
    const index = this.contents.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.contents[index] = { ...this.contents[index], ...itemData };
    return this.contents[index];
  }

  async delete(id) {
    const index = this.contents.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.contents.splice(index, 1);
    return true;
  }
}

module.exports = new ContentRepository();

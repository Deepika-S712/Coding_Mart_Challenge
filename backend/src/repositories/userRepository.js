import { users } from '../data/users.js';

export const userRepository = {
  findByEmail(email) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findById(id) {
    return users.find(u => u.id === id);
  },

  getAll() {
    return [...users];
  }
};

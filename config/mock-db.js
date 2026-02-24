// Simple in-memory mock database for testing
let users = [];

const mockUserSchema = {
  save: async function() {
    // Mock save
    if (this._id) return this;
    this._id = Math.random().toString(36).substr(2, 9);
    users.push(this);
    return this;
  }
};

const mockUser = {
  findOne: async function(query) {
    return users.find(u => Object.entries(query).every(([k, v]) => u[k] === v)) || null;
  },
  findById: async function(id) {
    return users.find(u => u._id === id) || null;
  },
  findByIdAndUpdate: async function(id, update, options) {
    const user = users.find(u => u._id === id);
    if (user) {
      Object.assign(user, update);
      return options?.new ? user : user;
    }
    return null;
  },
  create: async function(data) {
    const user = Object.assign({}, mockUserSchema, data, { _id: Math.random().toString(36).substr(2, 9) });
    users.push(user);
    return user;
  },
};

module.exports = { mockUser, mockUserSchema };

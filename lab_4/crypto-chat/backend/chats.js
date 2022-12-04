const User = require("./user-model");

class ChatService {
  constructor() {
    this.users = [];
  }

  joinUser(user_id, name) {
    const user = new User(user_id, name);
    this.users.push(user);
    return user;
  }

  getUser(id) {
    return this.users.find((user) => user.user_id === id);
  }

  disconnectUser(id) {
    const index = this.users.findIndex((user) => user.user_id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  getUsers() {
    return this.users;
  }

  generateP() {
    return Math.random();
  }
}

module.exports = new ChatService();

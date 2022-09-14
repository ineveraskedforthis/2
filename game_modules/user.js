"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.SocketWrapper = exports.UserData = void 0;
class UserData {
    constructor(id, char_id, login, password_hash) {
        this.id = id;
        this.char_id = char_id;
        this.login = login;
        this.password_hash = password_hash;
    }
}
exports.UserData = UserData;
class SocketWrapper {
    constructor(socket) {
        this.socket = socket;
        this.user_id = '#';
    }
}
exports.SocketWrapper = SocketWrapper;
class User {
    constructor(socket, data) {
        this.socket = socket;
        this.data = data;
        this.logged_in = false;
    }
}
exports.User = User;

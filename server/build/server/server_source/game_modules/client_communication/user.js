"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.SocketWrapper = exports.UserData = void 0;
const causality_graph_1 = require("./causality_graph");
class UserData {
    constructor(id, char_id, login, password_hash, tester_flag) {
        this.id = id;
        this.char_id = char_id;
        this.login = login;
        this.password_hash = password_hash;
        this.tester_account = tester_flag;
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
        this.character_created = false;
        this.character_removed = false;
        this.updates = causality_graph_1.Update.construct();
    }
}
exports.User = User;

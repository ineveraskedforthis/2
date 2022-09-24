"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.RequiredUpdates = exports.SocketWrapper = exports.UserData = void 0;
const causality_graph_1 = require("./causality_graph");
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
class RequiredUpdates {
    constructor() {
        this.character_status = false;
        this.savings = false;
        this.stash = false;
        this.inventory = false;
        this.character_created = false;
        this.all_skills = false;
        this.cooking = false;
        this.cook_elo = false;
    }
    switch_on_all_data() {
        this.character_status = true;
        this.savings = true;
        this.stash = true;
        this.inventory = true;
        this.all_skills = true;
        // this.cooking = true
    }
    turn_off_all() {
        this.character_status = false;
        this.savings = false;
        this.stash = false;
        this.inventory = false;
        this.character_created = false;
        this.all_skills = false;
        this.cooking = false;
        this.cook_elo = false;
    }
    turn_on_cooking() {
        if (this.all_skills)
            return;
        this.cooking = true;
        this.cook_elo = true;
    }
    turn_on_all_skills() {
        this.all_skills = true;
        this.cooking = false;
        this.cook_elo = false;
    }
    new_character() {
        this.switch_on_all_data();
        this.character_created = true;
    }
}
exports.RequiredUpdates = RequiredUpdates;
class User {
    constructor(socket, data) {
        this.socket = socket;
        this.data = data;
        this.logged_in = false;
        this.character_created = false;
        this.market_update = false;
        this.updates = causality_graph_1.Update.construct();
    }
}
exports.User = User;

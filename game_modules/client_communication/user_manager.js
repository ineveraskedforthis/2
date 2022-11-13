"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagement = exports.users_online_dict = exports.users_data_dict = void 0;
const user_1 = require("../client_communication/user");
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;
const fs_1 = __importDefault(require("fs"));
const human_1 = require("../character/races/human");
const systems_communication_1 = require("../systems_communication");
const updates_1 = require("./network_actions/updates");
const alerts_1 = require("./network_actions/alerts");
const causality_graph_1 = require("./causality_graph");
const events_1 = require("../events/events");
const game_launch_1 = require("../../game_launch");
var path = require('path');
exports.users_data_dict = {};
var users_data_list = [];
var login_to_user_data = {};
exports.users_online_dict = {};
var users_to_update = new Set();
var last_id = 0;
const save_path = path.join(game_launch_1.SAVE_GAME_PATH, 'users.txt');
var UserManagement;
(function (UserManagement) {
    function load_users() {
        console.log('loading users');
        if (!fs_1.default.existsSync(save_path)) {
            fs_1.default.writeFileSync(save_path, '');
        }
        let data = fs_1.default.readFileSync(save_path).toString();
        let lines = data.split('\n');
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            let data = line.split(' ');
            console.log(data);
            let char_id = '@';
            if (data[1] != '@') {
                char_id = Number(data[1]);
            }
            let user = new user_1.UserData(Number(data[0]), char_id, data[2], data[3]);
            exports.users_data_dict[user.id] = user;
            login_to_user_data[user.login] = user;
            users_data_list.push(user);
            if (user.id > last_id) {
                last_id = user.id;
            }
        }
        console.log('users are loaded');
    }
    UserManagement.load_users = load_users;
    function save_users() {
        console.log('saving users');
        let str = '';
        for (let item of users_data_list) {
            str = str + item.id + ' ' + item.char_id + ' ' + item.login + ' ' + item.password_hash + '\n';
        }
        fs_1.default.writeFileSync(save_path, str);
        console.log('users saved');
    }
    UserManagement.save_users = save_users;
    function log_out(sw) {
        if (sw.user_id == '#')
            return;
        exports.users_online_dict[sw.user_id].logged_in = false;
    }
    UserManagement.log_out = log_out;
    function link_socket_wrapper_and_user(sw, user) {
        user.socket = sw.socket;
        sw.user_id = user.data.id;
        user.logged_in = true;
    }
    UserManagement.link_socket_wrapper_and_user = link_socket_wrapper_and_user;
    function construct_user(sw, data) {
        console.log('constructing online user ' + data.id);
        let user = new user_1.User(sw.socket, data);
        sw.user_id = user.data.id;
        exports.users_online_dict[sw.user_id] = user;
        save_users();
        return user;
    }
    UserManagement.construct_user = construct_user;
    function construct_user_data(char_id, login, hash) {
        last_id = (last_id + 1);
        let user_data = new user_1.UserData(last_id, char_id, login, hash);
        exports.users_data_dict[last_id] = user_data;
        login_to_user_data[login] = user_data;
        users_data_list.push(user_data);
        return user_data;
    }
    function login_user(sw, data) {
        // check that user exists
        let user_data = login_to_user_data[data.login];
        if (user_data == undefined) {
            return { login_prompt: 'wrong-login', user: undefined };
        }
        // compare hash of password with hash in storage
        var password_hash = user_data.password_hash;
        let responce = bcrypt.compareSync(data.password, password_hash);
        if (responce) {
            var user = construct_user(sw, user_data);
            user.logged_in = true;
            return ({ login_prompt: 'ok', user: user });
        }
        return { login_prompt: 'wrong-password', user: undefined };
    }
    UserManagement.login_user = login_user;
    function register_user(sw, data) {
        if (login_to_user_data[data.login] != undefined) {
            return { reg_prompt: 'login-is-not-available', user: undefined };
        }
        let hash = bcrypt.hashSync(data.password, salt);
        let user_data = construct_user_data('@', data.login, hash);
        let user = construct_user(sw, user_data);
        user.logged_in = true;
        return ({ reg_prompt: 'ok', user: user });
    }
    UserManagement.register_user = register_user;
    function user_exists(id) {
        if (exports.users_data_dict[id] == undefined) {
            return false;
        }
        return true;
    }
    UserManagement.user_exists = user_exists;
    function user_was_online(id) {
        let x = exports.users_online_dict[id];
        if (x == undefined)
            return false;
        return true;
    }
    UserManagement.user_was_online = user_was_online;
    function user_is_online(id) {
        let x = exports.users_online_dict[id];
        if (x == undefined)
            return false;
        if (!x.logged_in)
            return false;
        return true;
    }
    UserManagement.user_is_online = user_is_online;
    function get_user(id) {
        return exports.users_online_dict[id];
    }
    UserManagement.get_user = get_user;
    function get_user_data(id) {
        return exports.users_data_dict[id];
    }
    UserManagement.get_user_data = get_user_data;
    function get_new_character(id, name, model_variation, starting_cell) {
        let user = get_user_data(id);
        if (user.char_id != '@') {
            console.log('attempt to generate character for user who already owns one');
            return;
        }
        const character = events_1.Event.new_character(human_1.HumanTemplateNotAligned, name, starting_cell, model_variation);
        console.log('user ' + user.login + ' gets new character: ' + character.name + '(id:' + character.id + ')');
        systems_communication_1.Link.character_and_user_data(character, user);
        // save_users()
    }
    UserManagement.get_new_character = get_new_character;
    function add_user_to_update_queue(id, reason) {
        if (id == '#')
            return;
        let user = get_user(id);
        if (user == undefined)
            return;
        if (reason == 'character_creation') {
            user.character_created = true;
        }
        else if (reason == 'character_removal') {
            user.character_removed = true;
        }
        else {
            causality_graph_1.Update.on(user.updates, reason);
        }
        users_to_update.add(user);
    }
    UserManagement.add_user_to_update_queue = add_user_to_update_queue;
    function update_users() {
        // console.log('update loop')
        for (let item of users_to_update) {
            console.log('send_update to ' + item.data.login);
            if (item.character_created) {
                send_character_to_user(item);
                item.character_created = false;
            }
            if (item.character_removed) {
                alerts_1.Alerts.character_removed(item);
            }
            else {
                causality_graph_1.Update.update_root(item);
                item.updates = causality_graph_1.Update.construct();
            }
            if (item.market_update) {
                updates_1.SendUpdate.market(item);
            }
        }
        users_to_update.clear();
    }
    UserManagement.update_users = update_users;
    function send_character_to_user(user) {
        alerts_1.Alerts.generic_user_alert(user, 'character_exists', undefined);
        updates_1.SendUpdate.all(user);
        causality_graph_1.Update.update_root(user);
        alerts_1.Alerts.generic_user_alert(user, 'loading_completed', '');
    }
    UserManagement.send_character_to_user = send_character_to_user;
})(UserManagement = exports.UserManagement || (exports.UserManagement = {}));

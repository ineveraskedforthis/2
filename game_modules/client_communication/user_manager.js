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
const system_1 = require("../base_game_classes/character/system");
const human_1 = require("../base_game_classes/character/races/human");
const systems_communication_1 = require("../systems_communication");
const updates_1 = require("./network_actions/updates");
const alerts_1 = require("./network_actions/alerts");
const causality_graph_1 = require("./causality_graph");
exports.users_data_dict = {};
var users_data_list = [];
var login_to_user_data = {};
exports.users_online_dict = {};
var users_to_update = new Set();
var last_id = 0;
var UserManagement;
(function (UserManagement) {
    function load_users() {
        console.log('loading users');
        let data = fs_1.default.readFileSync('users.txt').toString();
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
    }
    UserManagement.load_users = load_users;
    function save_users() {
        console.log('saving users');
        let str = '';
        for (let item of users_data_list) {
            str = str + item.id + ' ' + item.char_id + ' ' + item.login + ' ' + item.password_hash + '\n';
        }
        fs_1.default.writeFileSync('users.txt', str);
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
        let character = system_1.CharacterSystem.template_to_character(human_1.HumanTemplateNotAligned, name, starting_cell);
        character.set_model_variation(model_variation);
        console.log('user ' + user.login + ' gets new character: ' + name + '(id:' + character.id + ')');
        systems_communication_1.Link.character_and_user_data(character, user);
    }
    UserManagement.get_new_character = get_new_character;
    function add_user_to_update_queue(id, reason) {
        console.log('add user to update');
        console.log(id);
        if (id == '#')
            return;
        let user = get_user(id);
        if (user == undefined)
            return;
        console.log('ok');
        if (reason == 'character_creation')
            user.character_created = true;
        if (reason == 'market')
            user.market_update = true;
        users_to_update.add(user);
    }
    UserManagement.add_user_to_update_queue = add_user_to_update_queue;
    function update_users() {
        console.log('update loop');
        for (let item of users_to_update) {
            console.log('send_update to ' + item.data.login);
            if (item.character_created) {
                alerts_1.Alerts.generic_user_alert(item, 'character_exists', undefined);
                updates_1.SendUpdate.all(item);
                item.character_created = false;
            }
            if (item.market_update) {
                updates_1.SendUpdate.market(item);
            }
            causality_graph_1.Update.update_root(item);
        }
        users_to_update.clear();
    }
    UserManagement.update_users = update_users;
})(UserManagement = exports.UserManagement || (exports.UserManagement = {}));

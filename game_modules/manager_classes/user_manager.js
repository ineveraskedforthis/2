"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagement = exports.users_online_list = exports.users_data_list = void 0;
const user_1 = require("../user");
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;
const fs_1 = require("fs");
exports.users_data_list = {};
var login_to_user_data = {};
exports.users_online_list = {};
var last_id = 0;
var UserManagement;
(function (UserManagement) {
    function load_users_raw() {
        (0, fs_1.readFile)('/data/users.txt', 'utf-8', (err, data) => {
            if (err) {
                return '';
            }
            return data;
        });
        return '';
    }
    function load_users() {
        console.log('loading users');
        let data = load_users_raw();
        let lines = data.split('\n');
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            let data = line.split(' ');
            console.log(data);
            let user = new user_1.UserData(Number(data[0]), Number(data[1]), data[2], data[3]);
            exports.users_data_list[user.id] = user;
            login_to_user_data[user.login] = user;
            if (user.id > last_id) {
                last_id = user.id;
            }
        }
    }
    UserManagement.load_users = load_users;
    function save_users() {
    }
    UserManagement.save_users = save_users;
    function log_out(sw) {
        if (sw.user_id == '#')
            return;
        exports.users_online_list[sw.user_id].logged_in = false;
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
        exports.users_online_list[sw.user_id] = user;
        return user;
    }
    UserManagement.construct_user = construct_user;
    function construct_user_data(char_id, login, hash) {
        last_id = last_id + 1;
        let user_data = new user_1.UserData(last_id, char_id, login, hash);
        return user_data;
    }
    // async load_user_to_memory(pool: PgPool, data: any) {
    //     var user = this.create_new_user();
    //     await user.load_from_json(pool, data);
    //     this.users[user.id] = user;
    //     return user;
    // }
    function login_user(sw, data) {
        let user_data = login_to_user_data[data.login];
        if (user_data == undefined) {
            return { login_prompt: 'wrong-login', user: undefined };
        }
        var password_hash = user_data.password_hash;
        let responce = bcrypt.compare(data.password, password_hash);
        if (responce) {
            var user = construct_user(sw, user_data);
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
        return ({ reg_prompt: 'ok', user: user });
    }
    UserManagement.register_user = register_user;
    function user_exists(id) {
        if (exports.users_data_list[id] == undefined) {
            return false;
        }
        return true;
    }
    UserManagement.user_exists = user_exists;
    function user_was_online(id) {
        let x = exports.users_online_list[id];
        if (x == undefined)
            return false;
        return true;
    }
    UserManagement.user_was_online = user_was_online;
    function user_is_online(id) {
        let x = exports.users_online_list[id];
        if (x == undefined)
            return false;
        if (x.logged_in)
            return false;
    }
    UserManagement.user_is_online = user_is_online;
    function get_user(id) {
        return exports.users_online_list[id];
    }
    UserManagement.get_user = get_user;
    function get_user_data(id) {
        return exports.users_data_list[id];
    }
    UserManagement.get_user_data = get_user_data;
    // function get_new_char(pool: PgPool) {
    //     console.log('user ' + this.id + ' receives a new character')
    //     let old_character = this.get_character()
    //     if (old_character != undefined) {
    //         old_character.user_id = -1;
    //     }  
    //     let character = await this.world.create_new_character(pool, this.login, this.world.get_cell_id_by_x_y(0, 3), this.id)
    //     this.char_id = character.id
    //     character.user_id = this.id;
    //     if ((this.world.user_manager.get_user(this.id)) != undefined) {
    //         this.world.user_manager.get_user(this.id).char_id = character.id
    //     }
    //     character.add_explored(1);
    //     await this.save_to_db(pool);
    //     console.log('NEW CHARACTER')
    //     if (this.socket != undefined) {
    //         this.socket.emit('map-data-reset')
    //         this.world.socket_manager.send_all(character)
    //         this.socket.emit('battle-action', {action: 'stop_battle'})
    //     }
    //     return this.char_id
    // }
})(UserManagement = exports.UserManagement || (exports.UserManagement = {}));

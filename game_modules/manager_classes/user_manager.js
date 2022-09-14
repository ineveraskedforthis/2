"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = exports.UserManagement = exports.users_online = exports.users = void 0;
const user_1 = require("../user");
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;
const constants_1 = require("../static_data/constants");
const game_launch_1 = require("../../game_launch");
const fs_1 = require("fs");
var UserManagement;
(function (UserManagement) {
    function create_dummy_user(socket) {
        return new user_1.DummyUser(socket);
    }
    UserManagement.create_dummy_user = create_dummy_user;
    function load_users_raw() {
        (0, fs_1.readFile)('/data/users.txt', 'utf-8', (err, data) => {
            if (err) {
                return '';
            }
            return data;
        });
        return '';
    }
    async function load_users() {
        console.log('loading users');
        let data = load_users_raw();
        let lines = data.split('\n');
        let users_list = [];
        for (let line of lines) {
            if (line == '') {
                continue;
            }
            let data = line.split(' ');
            console.log(data);
            let user = new user_1.User(Number(data[0]), Number(data[1]), data[2], data[3]);
            users_list.push(user);
        }
        return exports.users;
    }
    UserManagement.load_users = load_users;
    function save_users() {
    }
    UserManagement.save_users = save_users;
    function register_player(data) {
        var login_is_available = this.check_login(pool, data.login);
        if (!login_is_available) {
            return { reg_prompt: 'login-is-not-available', user: undefined };
        }
        var hash = bcrypt.hash(data.password, salt);
        var new_user = this.create_new_user();
        new_user.set_login(data.login);
        new_user.set_password_hash(hash);
        // var id = 
        // var id = await new_user.init(pool);
        // this.users[id] = new_user;
        return ({ reg_prompt: 'ok', user: new_user });
    }
})(UserManagement = exports.UserManagement || (exports.UserManagement = {}));
class UserManager {
    constructor() {
        this.users = [];
        this.users_online = [];
    }
    async reg_player(pool) {
    }
    create_new_user() {
        return new user_1.User();
    }
    async login_player(pool, data) {
        var user_data = await this.load_user_data_from_db(pool, data.login);
        if (user_data == undefined) {
            return { login_prompt: 'wrong-login', user: undefined };
        }
        var password_hash = user_data.password_hash;
        var f = await bcrypt.compare(data.password, password_hash);
        if (f) {
            var user = await this.load_user_to_memory(pool, user_data);
            return ({ login_prompt: 'ok', user: user });
        }
        return { login_prompt: 'wrong-password', user: undefined };
    }
    new_user_online(user) {
        if (user.id != -1) {
            this.users_online[user.id] = true;
            console.log(user.login, ' logged in');
            game_launch_1.socket_manager.update_user_list();
        }
    }
    user_disconnects(user) {
        if (this.users_online[user.id]) {
            this.users_online[user.id] = false;
            game_launch_1.socket_manager.update_user_list();
        }
    }
    get_user_from_character(character) {
        return this.users[character.user_id];
    }
    get_user(user_id) {
        return this.users[user_id];
    }
    async check_login(pool, login) {
        var res = await common.send_query(pool, constants_1.constants.find_user_by_login_query, [login]);
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            return true;
        }
        if (res.rows.length == 0) {
            return true;
        }
        return false;
    }
    async load_user_data_from_db(pool, login) {
        var res = await common.send_query(pool, constants_1.constants.find_user_by_login_query, [login]);
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            return undefined;
        }
        if (res.rows.length == 0) {
            return undefined;
        }
        return res.rows[0];
    }
    async load_user_to_memory(pool, data) {
        var user = this.create_new_user();
        await user.load_from_json(pool, data);
        this.users[user.id] = user;
        return user;
    }
}
exports.UserManager = UserManager;

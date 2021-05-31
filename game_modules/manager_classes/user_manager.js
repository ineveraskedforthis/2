"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const user_1 = require("../user");
var bcrypt = require('bcryptjs');
var salt = process.env.SALT;
var { constants } = require("../static_data/constants.js");
var common = require("../common.js");
class UserManager {
    constructor(world) {
        this.users = [];
        this.users_online = [];
        this.world = world;
    }
    async reg_player(pool, data) {
        var login_is_available = await this.check_login(pool, data.login);
        if (!login_is_available) {
            return { reg_prompt: 'login-is-not-available', user: undefined };
        }
        var hash = await bcrypt.hash(data.password, salt);
        var new_user = this.create_new_user();
        new_user.set_login(data.login);
        new_user.set_password_hash(hash);
        var id = await new_user.init(pool);
        this.users[id] = new_user;
        return ({ reg_prompt: 'ok', user: new_user });
    }
    create_new_user() {
        return new user_1.User(this.world);
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
            let socket_manager = this.world.socket_manager;
            socket_manager.update_user_list();
        }
    }
    user_disconnects(user) {
        if (this.users_online[user.id]) {
            this.users_online[user.id] = false;
            let socket_manager = this.world.socket_manager;
            socket_manager.update_user_list();
        }
    }
    get_user_from_character(character) {
        return this.users[character.user_id];
    }
    get_user(user_id) {
        return this.users[user_id];
    }
    async check_login(pool, login) {
        var res = await common.send_query(pool, constants.find_user_by_login_query, [login]);
        if (res.rows.length == 0) {
            return true;
        }
        return false;
    }
    async load_user_data_from_db(pool, login) {
        var res = await common.send_query(pool, constants.find_user_by_login_query, [login]);
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

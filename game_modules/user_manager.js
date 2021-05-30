var bcrypt = require('bcryptjs');
var User = require('./user.js');
var salt = process.env.SALT;

var {constants} = require("./static_data/constants.js")
var common = require("./common.js")

module.exports = class UserManager{
    constructor(world) {
        this.users = {};
        this.users_online = {};
        this.world = world;
    }

    async reg_player(pool, data) {
        var login_is_available = await this.check_login(pool, data.login);
        if (!login_is_available) {
            return {reg_promt: 'login-is-not-available', user: null};
        }
        var hash = await bcrypt.hash(data.password, salt);
        var new_user = this.create_new_user();
        new_user.set_login(data.login);
        new_user.set_password_hash(hash);
        var id = await new_user.init(pool);
        this.users[id] = new_user;
        return({reg_promt: 'ok', user: new_user});
    }

    create_new_user() {
        return new User(this.world)
    }

    async login_player(pool, data) {
        var user_data = await this.load_user_data_from_db(pool, data.login);
        if (user_data == undefined) {
            return {login_promt: 'wrong-login', user: undefined};
        }
        var password_hash = user_data.password_hash;
        var f = await bcrypt.compare(data.password, password_hash);
        if (f) {
            var user = await this.load_user_to_memory(pool, user_data);
            return({login_promt: 'ok', user: user});
        }
        return {login_promt: 'wrong-password', user: undefined};
    }

    new_user_online(login) {
        this.users_online[login] = true;
        console.log(login, ' logged in');
        var socket_manager = this.world.socket_manager;
        socket_manager.update_user_list();
    }
    
    user_disconnects(login) {
        if (login in this.users_online) {
            this.users_online[login] = false;
        }
        var socket_manager = this.world.socket_manager;
        socket_manager.update_user_list();
    }

    get_user_from_character(character) {
        return this.users[character.user_id]
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
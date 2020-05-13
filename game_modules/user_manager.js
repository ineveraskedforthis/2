var bcrypt = require('bcryptjs');
var User = require('./user.js');
var salt = process.env.SALT;
var validator = require('validator');

module.exports = class UserManager{
    constructor() {
        this.users = {};
        this.users_online = [];
    }

    async reg_player(pool, data) {
        var login_is_available = await this.check_login(pool, data.login);
        if (!login_is_available) {
            return {reg_promt: 'login-is-not-available', user: null};
        }
        var hash = await bcrypt.hash(data.password, salt);
        var new_user = new User();
        var id = await new_user.init(pool, this, data.login, hash);
        this.users[id] = new_user;
        this.chars[new_user.character.id] = new_user.character;
        return({reg_promt: 'ok', user: new_user});
    }

    async login_player(pool, data) {
        var user_data = await this.load_user_data_from_db(pool, data.login);
        if (user_data == null) {
            return {login_promt: 'wrong-login', user: null};
        }
        var password_hash = user_data.password_hash;
        var f = await bcrypt.compare(data.password, password_hash);
        if (f) {
            var user = await this.load_user_to_memory(pool, user_data);
            return({login_promt: 'ok', user: user});
        }
        return {login_promt: 'wrong-password', user: null};
    }

    new_user_online(login) {
        this.world.users_online[login] = true;
        this.update_user_list();
    }
    
    user_disconnects(login) {
        if (login in this.world.users_online) {
            this.world.users_online[login] = false;
        }
        this.update_user_list();
    }

    validate_creds(data) {
        if (data.login.length == 0) {
            return 'empty-login';
        }
        if (data.login.length >= 30) {
            return 'too-long';
        }
        if (data.password.length == 0){
            return 'empty-pass';
        }
        if (!validator.isAlphanumeric(data.login, 'en-US')){
            return 'login-not-allowed-symbols';
        }
        return 'ok';
    }
}
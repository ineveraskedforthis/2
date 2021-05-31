"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
var { constants } = require("./static_data/constants.js");
var common = require("./common.js");
class User {
    constructor(world) {
        this.world = world;
        this.id = -1;
        this.char_id = -1;
        this.login = 'no_login';
        this.password_hash = '';
        this.logged_in = false;
    }
    async init(pool) {
        this.id = await this.world.get_new_id(pool, 'user_id');
        await this.get_new_char(pool);
        await this.load_to_db(pool);
        return this.id;
    }
    init_by_user(user) {
        this.id = user.id;
        this.char_id = user.char_id;
        this.login = user.login;
        this.password_hash = user.password_hash;
        this.logged_in = true;
    }
    set_login(login) {
        this.login = login;
    }
    set_password_hash(hash) {
        this.password_hash = hash;
    }
    get_character() {
        return this.world.get_char_from_id(this.char_id);
    }
    async get_new_char(pool) {
        let character = await this.world.create_new_character(pool, this.login, undefined, this.id, 'colony');
        this.char_id = character.id;
        character.user_id = this.id;
        character.add_explored(1);
        await this.save_to_db(pool);
        if (this.socket != undefined) {
            this.world.socket_manager.send_all(character);
        }
        return this.char_id;
    }
    set_socket(socket) {
        this.socket = socket;
    }
    send_death_message() {
        if (this.socket != undefined) {
            this.socket.emit('alert', 'you_are_dead');
        }
    }
    async load_from_json(pool, data) {
        common.flag_log(data, constants.logging.user.load_from_json);
        this.id = data.id;
        this.set_login(data.login);
        this.set_password_hash(data.password_hash);
        this.char_id = data.char_id;
        console.log('user ' + this.id + ' loading character ' + this.char_id);
        console.log('character is loaded? ' + (this.world.get_char_from_id(this.char_id) != undefined));
        if (this.world.get_char_from_id(this.char_id) != undefined) {
            if (this.get_character().get_hp() == 0) {
                await this.world.kill(pool, this.char_id);
            }
        }
        else {
            await this.get_new_char(pool);
        }
    }
    async load_to_db(pool) {
        console.log('loading user to db');
        await common.send_query(pool, constants.new_user_query, [this.login, this.password_hash, this.id, this.char_id]);
    }
    async save_to_db(pool) {
        console.log('saving user changes to db');
        await common.send_query(pool, constants.update_user_query, [this.id, this.char_id]);
    }
}
exports.User = User;

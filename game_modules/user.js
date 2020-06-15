var constants = require("./constants.js");
var common = require("./common.js");

var Character = require("./character.js")

module.exports = class User {
    constructor(world) {
        this.world = world;
    }

    async init(pool) {        
        this.id = await this.world.get_new_id(pool, 'user_id');
        await this.get_new_char(pool);
        await this.load_to_db(pool);
        return this.id;
    }

    set_login(login) {
        this.login = login;
    }

    set_password_hash(hash) {
        this.password_hash = hash
    }

    async get_new_char(pool) {
        this.character = new Character(this.world);
        this.char_id = await this.character.init(pool, this.login, 0, this.id);
        console.log(this.char_id);
        this.save_to_db();
        return this.char_id
    }

    set_socket(socket) {
        this.socket = socket;
    }

    async load_from_json(pool, data) {
        common.flag_log(data, constants.logging.user.load_from_json);
        this.id = data.id;
        this.set_login(data.login)
        this.set_password_hash(data.password_hash)
        this.char_id = data.char_id;
        console.log('user ' + this.id + ' loading character ' + this.char_id);
        console.log('character is loaded? ' + (this.world.chars[this.char_id] != undefined));
        if (this.world.chars[this.char_id] != undefined) {
            this.character = this.world.chars[this.char_id]
            this.character.user = this;
        } else {
            var char_data = await this.world.load_character_data_from_db(pool, this.char_id);
            var character = await this.world.load_character_data_to_memory(pool, char_data);
            this.character = character;
        }
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.new_user_query, [this.login, this.password_hash, this.id, this.char_id]);
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_user_query, [this.char_id]);
    }
}
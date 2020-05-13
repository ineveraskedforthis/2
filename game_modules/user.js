var constants = require("./constants.js");
var common = require("./common.js");

var Character = require("./character.js")

module.exports = class User {
    async init(pool, world, login, hash) {
        this.login = login;
        this.id = await world.get_new_id(pool, 'user_id');
        this.socket = null;
        this.world = world;
        this.password_hash = hash;
        await this.get_new_char(pool);
        await this.load_to_db(pool);
        return this.id;
    }

    async get_new_char(pool) {
        this.character = new Character();
        this.char_id = await this.character.init(pool, this.world, this.login, 0, this.id);
        return this.char_id
    }

    set_socket(socket) {
        this.socket = socket;
    }

    async load_from_json(pool, world, data) {
        this.login = data.login;
        this.id = data.id;
        this.socket = null;
        this.world = world;
        this.password_hash = data.password_hash;
        this.char_id = data.char_id;
        var char_data = await world.load_character_data_from_db(pool, this.char_id);
        var character = await world.load_character_data_to_memory(pool, char_data);
        this.character = character;
    }

    async load_to_db(pool) {
        await common.send_query(pool, constants.new_user_query, [this.login, this.password_hash, this.id, this.char_id]);
    }

    async save_to_db(pool) {
        await common.send_query(pool, constants.update_user_query, [this.char_id]);
    }
}
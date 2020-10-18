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
        this.character.user = this;
        this.world.chars[this.char_id] = this.character;
        await this.save_to_db(pool);
        if (this.socket != undefined) {
            // console.log(this.character.data.other)
            this.world.socket_manager.send_all(this.character)
        }
        return this.char_id
    }

    set_socket(socket) {
        this.socket = socket;
    }

    send_death_message() {
        if (this.socket != undefined) {
            this.socket.emit('alert', 'you_are_dead')
        }
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
            if (this.character.hp == 0) {
                await this.world.kill(pool, this.character.id)
            }
        } else {
            await this.get_new_char(pool)
        }
    }

    async load_to_db(pool) {
        console.log('loading user to db')
        await common.send_query(pool, constants.new_user_query, [this.login, this.password_hash, this.id, this.char_id]);
    }

    async save_to_db(pool) {
        console.log('saving user changes to db')
        await common.send_query(pool, constants.update_user_query, [this.id, this.char_id]);
    }
}
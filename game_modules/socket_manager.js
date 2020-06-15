var common = require("./common.js");
var constants = require("./constants.js");
var basic_characters = require("./basic_characters.js");

module.exports = class SocketManager {
    constructor(pool, io, world) {
        this.world = world;
        this.io = io;
        this.pool = pool;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
        this.real_shit();
        this.sockets = new Set();
    }

    real_shit() {
        this.io.on('connection', async socket => {
            var user_data = {
                socket: socket,
                online: false,
                current_user: null,
                market_data: false
            }
            this.sockets.add(user_data);            
            this.connection(socket)
            socket.on('disconnect', () => this.disconnect(user_data));        
            socket.on('login', async data => this.login(socket, user_data, data));
            socket.on('reg', async data => this.registration(socket, user_data, data));
            socket.on('attack', async msg => this.attack(socket, user_data, msg));
            socket.on('buy', async msg => this.buy(socket, user_data, msg));
            socket.on('sell', async msg => this.sell(socket, user_data, msg));
            socket.on('up-skill', async msg => this.up_skill(socket, user_data, msg));
            socket.on('set-tactic', async msg => this.set_tactic(socket, user_data, msg));
            socket.on('new-message', async msg => this.send_message(socket, msg + '', user_data.current_user));
            socket.on('char-info-detailed', () => this.send_char_info(socket, user_data.current_user));
            socket.on('send-market-data', (msg) => {user_data.market_data = msg})
        });
    }

    disconnect(user_data) {
        console.log('user disconnected');
        var user_manager = this.world.user_manager;
        if (user_data.online == true) {
            user_manager.user_disconnects(user_data.current_user.login);
        }
    }

    async connection(socket) {
        console.log('a user connected');
        
        socket.emit('tags', this.world.constants.TAGS);
        socket.emit('skill-tree', this.world.constants.SKILLS);
        socket.emit('tags-tactic', {target: ['undefined', 'me', 'closest_enemy'], value_tags: ['undefined', 'hp', 'blood', 'rage'], signs: ['undefined', '>', '>=', '<', '<=', '='], actions: ['undefined', 'attack']})
        var messages = await this.load_messages_from_database()
        for (let i = 0; i < messages.rows.length; i++) {
            let tmp = messages.rows[i];
            socket.emit('new-message', {id: tmp.id, msg: tmp.message, user: tmp.sender})
        }
    }

    async login(socket, user_data, data) {
        if (user_data.online) {
            socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }
        var user_manager = this.world.user_manager
        var error_message = common.validate_creds(data);
        socket.emit('is-login-valid', error_message);
        var answer = await user_manager.login_player(this.pool, data);
        socket.emit('is-login-completed', answer.login_promt);
        if (answer.login_promt == 'ok') {
            user_data.current_user = answer.user;
            user_data.current_user.set_socket(socket);
            user_manager.new_user_online(data.login);
            user_data.online = true;
            socket.emit('log-message', 'hello ' + data.login);
            this.send_battle_data_to_user(answer.user);
            this.update_char_info(socket, user_data.current_user);
        }
    }

    async registration(socket, user_data, data) {
        if (user_data.online) {
            socket.emit('is-reg-valid', 'you-are-logged-in');
            return;
        }
        var user_manager = this.world.user_manager;
        var error_message = common.validate_creds(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await user_manager.reg_player(this.pool, data);
        socket.emit('is-reg-completed', answer.reg_promt);
        if (answer.reg_promt == 'ok') {
            user_data.current_user = answer.user;
            user_data.current_user.set_socket(socket);            
            user_manager.new_user_online(data.login);
            user_data.online = true;
            socket.emit('log-message', 'hello ' + data.login);
            this.update_char_info(socket, user_data.current_user);
            common.flag_log('registration is finished', constants.logging.sockets.messages)
        }
    }

    // eslint-disable-next-line no-unused-vars
    async attack(socket, user_data, data) {
        common.flag_log('attack', constants.logging.sockets.messages)
        common.flag_log([user_data], constants.logging.sockets.messages)
        if (user_data.current_user != null && !user_data.current_user.character.data.in_battle) {
            var rat = await this.world.create_monster(this.pool, basic_characters.Rat, user_data.current_user.character.cell_id);
            var battle = await this.world.create_battle(this.pool, [user_data.current_user.character], [rat]);
            socket.emit('battle-has-started', battle.get_data())
        }
    }

    async buy(socket, user_data, msg) {
        var flag = common.validate_buy_data(this.world, msg);
        if ((user_data.current_user != null) && flag) {
            if (!(msg.max_price == null)) {
                msg.max_price = parseInt(msg.max_price);
            }
            await user_data.current_user.character.buy(this.pool, msg.tag, parseInt(msg.amount), parseInt(msg.money), msg.max_price);
            this.update_char_info(socket, user_data.current_user);
        }
    }

    async sell(socket, user_data, msg) {
        var flag = common.validate_sell_data(this.world, msg);
        if ((user_data.current_user != null) && flag) {
            await user_data.current_user.character.sell(this.pool, msg.tag, parseInt(msg.amount), parseInt(msg.price));
            this.update_char_info(socket, user_data.current_user);
        }
    }

    async up_skill(socket, user_data, msg) {
        if (msg in this.world.constants.SKILLS && user_data.current_user != null) {
            await user_data.current_user.character.add_skill(this.pool, msg + '');
            this.update_char_info(socket, user_data.current_user);
        }
    }

    async set_tactic(socket, user_data, msg) {
        if (user_data.current_user != null) {
            await user_data.current_user.character.set_tactic(this.pool, msg);
        }
    }

    send_battle_data_to_user(user) {
        let character = user.character;
        if (character.data.in_battle) {
            let battle = this.world.battles[character.data.battle_id];
            this.send_to_user(user, 'battle-has-started', battle.get_data());
        }
    }

    send_message_to_character_user(character, msg) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_message_to_user(user, msg);
    }

    send_to_character_user(character, tag, msg) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_to_user(user, tag, msg);
    }

    send_message_to_user(user, msg) {
        this.send_to_user(user, 'log-message', msg)
    }

    send_to_user(user, tag, msg) {
        if (user&&this.world.user_manager.users_online[user.login]) {
            user.socket.emit(tag, msg)
        }
    }

    update_char_info(socket, user) {
        socket.emit('char-info', user.character.get_json());
    }

    send_char_info(socket, user) {
        socket.emit('char-info-detailed', {equip: user.character.equip.data})
    }
    
    update_market_info(cell) {
        var data = cell.market.get_orders_list();
        if (constants.logging.sockets.update_market_info) {
            console.log('sending market orders to client');
            console.log(data);
        }
        for (let i of this.sockets) {
            if (i.online & i.market_data) {
                i.socket.emit('market-data', data)
            }
        }
    }

    update_user_list(){
        var tmp = [];
        var users_online = this.world.user_manager.users_online;
        for (var i in users_online) {
            if (users_online[i]) {
                tmp.push(i);
            }
        }
        this.io.emit('users-online', tmp);
    }
    
    async send_message(socket, msg, user) {
        if (msg.length > 1000) {
            socket.emit('new-message', 'message-too-long')
            return
        }
        // msg = validator.escape(msg)
        var id = await this.world.get_new_id(this.pool, 'messages')
        var message = {id: id, msg: msg, user: 'аноньчик'};
        if (user != null) {
            message.user = user.login;
        }
        await this.load_message_to_database(message);
        this.io.emit('new-message', message);
    }

    async load_message_to_database(message) {
        await common.send_query(this.pool, constants.new_message_query, [message.id, message.msg, message.user]);
        await common.send_query(this.pool, constants.clear_old_messages_query, [message.id - 50]);
    }

    async load_messages_from_database() {
        var rows = await common.send_query(this.pool, constants.get_messages_query);
        return rows
    }
}
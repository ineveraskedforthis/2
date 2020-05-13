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
    }

    real_shit() {
        this.io.on('connection', async socket => {
            var online = false;
            var current_user = null;
            this.connection(socket)
            socket.on('disconnect', () => this.disconnect(current_user, online));        
            socket.on('login', async data => this.login(socket, current_user, online, data));
            socket.on('reg', async data => this.registration(socket, current_user, online, data));
            socket.on('attack', async msg => this.attack(socket, current_user, online, msg));
            socket.on('buy', async msg => this.buy(socket, current_user, online, msg));
            socket.on('sell', async msg => this.sell(socket, current_user, online, msg));
            socket.on('up-skill', async msg => this.up_skill(socket, current_user, online, msg));
            socket.on('set-tactic', async msg => this.set_tactic(socket, current_user, online, msg));
            socket.on('new-message', async msg => this.send_message(socket, msg + '', current_user));
        });
    }

    disconnect(current_user, online,) {
        console.log('user disconnected');
        var user_manager = this.world.user_manager;
        if (online == true) {
            user_manager.user_disconnects(current_user.login);
        }
    }

    connection(socket) {
        console.log('a user connected');
        socket.emit('tags', this.world.TAGS);
        socket.emit('skill-tree', this.world.SKILLS);
        socket.emit('tags-tactic', {target: ['undefined', 'me', 'closest_enemy'], value_tags: ['undefined', 'hp', 'blood', 'rage'], signs: ['undefined', '>', '>=', '<', '<=', '='], actions: ['undefined', 'attack']})
        for (var i of this.MESSAGES) {
            socket.emit('new-message', i);
        }
    }

    async login(socket, current_user, online, data) {
        // console.log(data);
        if (online) {
            socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }
        var user_manager = this.world.user_manager
        var error_message = common.validate_creds(data);
        socket.emit('is-login-valid', error_message);
        var answer = await this.world.login_player(this.pool, data);
        socket.emit('is-login-completed', answer.login_promt);
        if (answer.login_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);
            user_manager.new_user_online(data.login);
            online = true;
            socket.emit('log-message', 'hello ' + data.login);
            this.update_char_info(socket, current_user);
        }
    }

    async registration(socket, current_user, online, data) {
        if (online) {
            socket.emit('is-reg-valid', 'you-are-logged-in');
            return;
        }
        var user_manager = this.world.user_manager;
        var error_message = common.validate_creds(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await user_manager.reg_player(this.pool, data);
        // console.log(answer);
        socket.emit('is-reg-completed', answer.reg_promt);
        if (answer.reg_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);            
            user_manager.new_user_online(data.login);
            online = true;
            socket.emit('log-message', 'hello ' + data.login);
            this.update_char_info(socket, current_user);
        }
    }

    // eslint-disable-next-line no-unused-vars
    async attack(socket, current_user, online, data) {
        if (current_user != null && !current_user.character.in_battle) {
            var rat = await this.world.create_monster(this.pool, basic_characters.Rat, current_user.character.cell_id);
            var battle = await this.world.create_battle(this.pool, [current_user.character], [rat]);
            socket.emit('battle-has-started', battle.get_data())
        }
    }

    async buy(socket, current_user, online, msg) {
        var flag = common.validate_buying_data(msg);
        if ((current_user != null) && flag) {
            if (!(msg.max_price == null)) {
                msg.max_price = parseInt(msg.max_price);
            }
            await current_user.character.buy(this.pool, msg.tag, parseInt(msg.amount), parseInt(msg.money), msg.max_price);
            this.update_char_info(socket, current_user);
        }
    }

    async sell(socket, current_user, online, msg) {
        var flag = common.validate_sell_data(msg, this.world);
        if ((current_user != null) && flag) {
            if (constants.logging) {
                console.log('sell message', msg);
            }
            await current_user.character.sell(this.pool, msg.tag, parseInt(msg.amount), parseInt(msg.price));
            this.update_char_info(socket, current_user);
        }
    }

    async up_skill(socket, current_user, online, msg) {
        if (msg in constants.SKILLS && current_user != null) {
            await current_user.character.add_skill(this.pool, msg + '');
            this.update_char_info(socket, current_user);
        }
    }

    async set_tactic(socket, current_user, online, msg) {
        if (current_user != null) {
            await current_user.character.set_tactic(this.pool, msg);
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
        user.socket.emit(tag, msg)
    }

    update_char_info(socket, user) {
        socket.emit('char-info', user.character.get_json());
    }
    
    update_market_info(cell) {
        var data = cell.market.get_orders_list();
        if (constants.logging) {
            console.log('sending market orders to client');
            console.log(data);
        }
        this.io.emit('market-data', data);
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
    
    send_message(socket, msg, user) {
        if (msg.length > 1000) {
            socket.emit('new-message', 'message-too-long')
            return
        }
        // msg = validator.escape(msg)
    
        var message = {id: this.MESSAGE_ID, msg: msg, user: 'аноньчик'};
        this.MESSAGE_ID += 1;
        if (user != null) {
            message.user = user.login;
        }
        this.MESSAGES.push(message);
        if (this.MESSAGES.length > 50) {
            this.MESSAGES.shift()
        }
        this.io.emit('new-message', message);
    }

    
    
}
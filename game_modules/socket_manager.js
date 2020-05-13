var common = require("common.js")

module.exports = class SocketManager {
    constructor(world, io) {
        this.world = world;
        this.io = io;
        
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
    }

    disconnect(online, current_user) {
        console.log('user disconnected');
        if (online == true) {
            this.user_disconnects(current_user.login);
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
        var answer = await this.world.login_player(pool, data);
        socket.emit('is-login-completed', answer.login_promt);
        if (answer.login_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);
            this.new_user_online(io, world, data.login);
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
        var error_message = validate_creds(data);
        socket.emit('is-reg-valid', error_message);
        var answer = await world.reg_player(pool, data);
        // console.log(answer);
        socket.emit('is-reg-completed', answer.reg_promt);
        if (answer.reg_promt == 'ok') {
            current_user = answer.user;
            current_user.set_socket(socket);
            new_user_online(io, world, data.login);
            online = true;
            socket.emit('log-message', 'hello ' + data.login);
            update_char_info(socket, current_user);
        }
    }

    real_shit() {
        this.io.on('connection', async socket => {
            var online = false;
            var current_user = null;
            this.connection(socket)
        
            socket.on('disconnect', () => this.disconnect(current_user, online));
        
            socket.on('login', async data => this.login(socket, current_user, online, data));
        
            socket.on('reg', async data => this.registration(socket, current_user, online, data));
        
            socket.on('attack', async msg => {
                if (current_user != null && !current_user.character.in_battle) {
                    var rat = await world.create_monster(pool, Rat, current_user.character.cell_id);
                    var battle = await world.create_battle(pool, [current_user.character], [rat]);
                    socket.emit('battle-has-started', battle.get_data())
                }
            });
        
            socket.on('buy', async msg => {
                var flag = (world.TAGS.indexOf(msg.tag) > -1) && (validator.isInt(msg.amount)) && (validator.isInt(msg.money)) && (validator.isInt(msg.max_price) || msg.max_price == null);
                if ((current_user != null) && flag) {
                    if (!(msg.max_price == null)) {
                        msg.max_price = parseInt(msg.max_price);
                    }
                    await current_user.character.buy(pool, msg.tag, parseInt(msg.amount), parseInt(msg.money), msg.max_price);
                    update_char_info(socket, current_user);
                }
            });
        
            socket.on('sell', async msg => {
                var flag = (world.TAGS.indexOf(msg.tag) > -1) && (validator.isInt(msg.amount)) && (validator.isInt(msg.price));
                if ((current_user != null) && flag) {
                    if (logging) {
                        console.log('sell message', msg);
                    }
                    await current_user.character.sell(pool, msg.tag, parseInt(msg.amount), parseInt(msg.price));
                    update_char_info(socket, current_user);
                }
            });
        
            socket.on('up-skill', async msg => {
                if (msg in SKILLS && current_user != null) {
                    await current_user.character.add_skill(pool, msg + '');
                    update_char_info(socket, current_user);
                }
            });
            
            socket.on('set-tactic', async msg => {
                if (current_user != null) {
                    await current_user.character.set_tactic(pool, msg);
                }
            })
        
            socket.on('new-message', async msg => {
                send_message(socket, msg + '', current_user)
            });
        });
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
        if (logging) {
            console.log('sending market orders to client');
            console.log(data);
        }
        io.emit('market-data', data);
    }
    
    update_user_list(){
        var tmp = [];
        for (var i in world.users_online) {
            if (world.users_online[i]) {
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
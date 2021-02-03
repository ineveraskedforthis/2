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
        this.sessions = {};
    }

    generate_session(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
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
            socket.on('attack-outpost', async msg => this.attack_local_outpost(socket, user_data, msg));
            socket.on('buy', async msg => this.buy(user_data, msg));
            socket.on('sell', async msg => this.sell(user_data, msg));
            socket.on('up-skill', async msg => this.up_skill(user_data, msg));
            socket.on('set-tactic', async msg => this.set_tactic(user_data, msg));
            socket.on('new-message', async msg => this.send_message(socket, msg + '', user_data.current_user));
            socket.on('char-info-detailed', () => this.send_char_info(socket, user_data.current_user));
            socket.on('send-market-data', (msg) => {user_data.market_data = msg});
            socket.on('equip', async (msg) => this.equip(user_data, msg));
            socket.on('unequip', async (msg) => this.unequip(user_data, msg));
            socket.on('eat', async () => this.eat(user_data));
            socket.on('clean', async () => this.clean(user_data));
            socket.on('move', async (msg) => this.move(user_data, msg));
            socket.on('session', async (msg) => this.login_with_session(socket, user_data, msg));
            socket.on('clear_orders', async () => this.clear_orders(user_data));
            socket.on('sell-item', async (msg) => this.sell_item(user_data, msg));
            socket.on('buyout', async (msg) => this.buyout(user_data, msg));
            socket.on('cfood', async () => this.craft_food(socket, user_data));
            socket.on('cclothes', async () => this.craft_clothes(socket, user_data));
            socket.on('ench', async (msg) => this.enchant(socket, user_data, msg));
            socket.on('disench', async (msg) => this.disenchant(socket, user_data, msg));
            socket.on('battle-action', async (msg) => this.battle_action(socket, user_data, msg));
        });
    }

    disconnect(user_data) {
        console.log('user disconnected');
        var user_manager = this.world.user_manager;
        if (user_data.online == true) {
            user_manager.user_disconnects(user_data.current_user.login);
        }
    }

    async buyout(user_data, msg) {
        if (user_data.current_user != null) {
            let character = user_data.current_user.character;
            let market = character.get_cell().item_market;
            let id = parseInt(msg);
            if (isNaN(id)) {
                return
            }
            await market.buyout(this.pool, character, id)
            this.send_item_market_update_to_character(character);
        }
    }

    async equip(user_data, msg) {
        if (user_data.current_user != null) {
            let character = user_data.current_user.character;
            await character.equip_item(this.pool, msg);
        }
    }

    async unequip(user_data, msg) {
        if (user_data.current_user != null) {
            let character = user_data.current_user.character;
            await character.unequip_tag(this.pool, msg);
        }
    }

    async sell_item(user_data, msg) {
        if (user_data.current_user != null) {
            let character = user_data.current_user.character;
            let ind = parseInt(msg.index);
            let bo = parseInt(msg.buyout_price);
            let sp = parseInt(msg.starting_price);
            if ((isNaN(ind)) || (isNaN(bo)) || (isNaN(sp))) {
                return
            }
            await character.sell_item(this.pool, ind, bo, sp);
            let user = character.user;
            let socket = character.user.socket;
            this.send_char_info(socket, user);
        }
    }

    async connection(socket) {
        console.log('a user connected');
        
        socket.emit('tags', this.world.constants.TAGS);
        socket.emit('skill-tree', this.world.constants.SKILLS);
        socket.emit('tags-tactic', {target: ['undefined', 'me', 'closest_enemy'], value_tags: ['undefined', 'hp', 'blood', 'rage'], signs: ['undefined', '>', '>=', '<', '<=', '='], actions: ['undefined', 'attack', 'flee']})
        var messages = await this.load_messages_from_database()
        for (let i = 0; i < messages.rows.length; i++) {
            let tmp = messages.rows[i];
            socket.emit('new-message', {id: tmp.id, msg: tmp.message, user: tmp.sender})
        }
        console.log('data sent to user');
    }

    async login_with_session(socket, user_data, session) {
        console.log('attempt to login with session')
        if (session in this.sessions) {
            user_data.current_user = this.sessions[session].current_user;
            user_data.current_user.set_socket(socket);
            let user_manager = this.world.user_manager;
            let user = user_data.current_user
            user_manager.new_user_online(user.login);
            user_data.online = true;
            socket.emit('log-message', 'hello ' + user.login);
            socket.emit('is-login-completed', 'ok');
            this.send_battle_data_to_user(user);
            this.send_all(user.character);
        } else {
            socket.emit('reset_session');
        }
    }

    async login(socket, user_data, data) {
        console.log('login attempt')
        if (user_data.online) {
            socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }
        var user_manager = this.world.user_manager
        var error_message = common.validate_creds(data);
        socket.emit('is-login-valid', error_message);
        if (error_message != 'ok') {
            return
        }
        var answer = await user_manager.login_player(this.pool, data);
        socket.emit('is-login-completed', answer.login_promt);
        if (answer.login_promt == 'ok') {
            user_data.current_user = answer.user;
            user_data.current_user.set_socket(socket);
            user_manager.new_user_online(data.login);
            user_data.online = true;
            socket.emit('log-message', 'hello ' + data.login);
            this.send_battle_data_to_user(answer.user);
            this.send_all(user_data.current_user.character);

            let session = this.generate_session(20);
            socket.emit('session', session);
            this.sessions[session] = user_data;
            console.log('user ' + data.login + ' logged in')
        }
    }

    async registration(socket, user_data, data) {
        console.log('registration attempt')
        if (user_data.online) {
            socket.emit('is-reg-valid', 'you-are-logged-in');
            return;
        }
        var user_manager = this.world.user_manager;
        var error_message = common.validate_creds(data);
        socket.emit('is-reg-valid', error_message);
        if (error_message != 'ok') {
            return
        }
        var answer = await user_manager.reg_player(this.pool, data);
        socket.emit('is-reg-completed', answer.reg_promt);
        if (answer.reg_promt == 'ok') {
            user_data.current_user = answer.user;
            user_data.current_user.set_socket(socket);            
            user_manager.new_user_online(data.login);
            user_data.online = true;
            socket.emit('log-message', 'hello ' + data.login);
            this.send_all(user_data.current_user.character);
            common.flag_log('registration is finished', constants.logging.sockets.messages)

            let session = this.generate_session(20);
            socket.emit('session', session);
            this.sessions[session] = user_data;
            console.log('user ' + data.login + ' registrated')
        }
    }

    send_all(character) {
        this.send_to_character_user(character, 'name', character.name);
        this.send_hp_update(character);
        this.send_exp_update(character);
        this.send_status_update(character);
        this.send_tactics_info(character);
        this.send_savings_update(character);
        this.send_skills_info(character);
        this.send_map_pos_info(character);
        this.send_new_actions(character);
        this.send_item_market_update_to_character(character);
        this.send_explored(character);
        this.send_teacher_info(character);
        let user = character.user;
        let socket = character.user.socket;
        this.send_char_info(socket, user);
    }

    // actions

    async move(user_data, data) {
        if (user_data.current_user == null) {
            return 
        }
        if (data.x < 0 || data.x >= this.world.x) {
            return
        }
        if (data.y < 0 || data.y >= this.world.y) {
            return
        }
        let char = user_data.current_user.character;
        let res = await char.move(this.pool, data);
        if (res != 0) {
            user_data.socket.emit('map-pos', data);
            this.send_teacher_info(char);
        }
        if (res == 2) {
            user_data.socket.emit('alert', 'you are attacked');
            this.send_battle_data_to_user(user_data.current_user);
        }
    }

    // eslint-disable-next-line no-unused-vars
    async attack(socket, user_data, data) {
        common.flag_log('attack', constants.logging.sockets.messages)
        common.flag_log([user_data], constants.logging.sockets.messages)
        if (user_data.current_user != null && !user_data.current_user.character.data.in_battle) {
            let char = user_data.current_user.character;
            let battle = await char.attack_local_monster(this.pool);
            socket.emit('battle-has-started', battle.get_data())
        }
    }

    async attack_local_outpost(socket, user_data, data) {
        common.flag_log('attack', constants.logging.sockets.messages)
        common.flag_log([user_data], constants.logging.sockets.messages)
        if (user_data.current_user != null && !user_data.current_user.character.data.in_battle) {
            let char = user_data.current_user.character;
            let battle = await char.attack_local_outpost(this.pool);
            socket.emit('battle-has-started', battle.get_data())
        }
    }

    async clear_orders(user_data) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            await char.clear_orders(this.pool);
            this.send_savings_update(char);
            this.send_char_info(char);
        }
    }

    async buy(user_data, msg) {
        var flag = common.validate_buy_data(this.world, msg);
        if (isNaN(msg.max_price) || isNaN(msg.money) || isNaN(msg.amount)) {
            return
        }
        if ((user_data.current_user != null) && flag) {
            let char = user_data.current_user.character;
            await char.buy(this.pool, msg.tag, msg.amount, msg.money, msg.max_price);
            this.send_savings_update(char);
        }
    }

    async sell(user_data, msg) {
        var flag = common.validate_sell_data(this.world, msg);
        if ((user_data.current_user != null) && flag) {
            let char = user_data.current_user.character;
            await char.sell(this.pool, msg.tag, parseInt(msg.amount), parseInt(msg.price));
            this.send_savings_update(char);
        }
    }

    async up_skill(user_data, msg) {
        if (msg in this.world.constants.SKILLS && user_data.current_user != null) {
            let char = user_data.current_user.character;
            let result = await char.add_skill(this.pool, msg + '');
            if (result != undefined) {
                this.send_new_tactic_action(char, result);
            }
            this.send_skills_info(char);
            this.send_tactics_info(char);
            this.send_exp_update(char)
        }
    }

    async eat(user_data) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            char.eat(this.pool);
        }
    }

    async clean(user_data) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            char.clean(this.pool);
        }
    }

    async craft_food(socket, user_data) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            let res = await char.craft_food(this.pool);
            if (res != 'ok') {
                socket.emit('alert', res);
            }
        }
    }

    async craft_clothes(socket, user_data) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            let res = await char.craft_clothes(this.pool);
            if (res != 'ok') {
                socket.emit('alert', res);
            }
        }
    }

    async enchant(socket, user_data, msg) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            let res = await char.enchant(this.pool, msg);
            if (res != 'ok') {
                socket.emit('alert', res);
            }
        }
    }

    async disenchant(socket, user_data, msg) {
        if (user_data.current_user != null) {
            let char = user_data.current_user.character;
            let res = await char.disenchant(this.pool, msg);
            if (res != 'ok') {
                socket.emit('alert', res);
            }
        }
    }

    async set_tactic(user_data, msg) {
        if (user_data.current_user != null) {
            // console.log(msg)
            let char = user_data.current_user.character;
            await char.set_tactic(this.pool, msg);
            this.send_tactics_info(char);
        }
    }

    // information sending

    send_new_tactic_action(character, action) {
        this.send_to_character_user(character, 'new-action', action);
    }

    send_new_actions(character) {
        let actions = character.get_actions();
        for (let i of actions) {
            this.send_new_tactic_action(character, i);
        }
    }

    send_map_pos_info(character) {
        let cell_id = character.cell_id;
        let pos = this.world.get_cell_x_y_by_id(cell_id);
        this.send_to_character_user(character, 'map-pos', pos)
    }

    send_skills_info(character) {
        this.send_to_character_user(character, 'skills', character.data.skills)
    }

    send_tactics_info(character) {
        this.send_to_character_user(character, 'tactic', character.data.tactic)
    }

    send_battle_data_to_user(user) {
        let character = user.character;
        if (character.data.in_battle) {
            let battle = this.world.get_battle_from_id(character.data.battle_id);
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

    send_hp_update(character) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_to_user(user, 'hp', {hp: character.hp, mhp: character.max_hp});
    }

    send_exp_update(character) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_to_user(user, 'exp', {exp: character.data.exp, mexp: common.get_next_nevel_req(character.data.level), level: character.data.level, points: character.data.skill_points});
    }

    send_savings_update(character) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_to_user(user, 'savings', character.savings.get());
    }

    send_status_update(character) {
        this.send_to_character_user(character, 'status', character.data.other)
    }

    send_explored(character) {
        this.send_to_character_user(character, 'explore', character.data.explored)
    }

    send_char_info(socket, user) {
        if (user != null) {
            let char = user.character
            socket.emit('char-info-detailed', {equip: char.equip.data, stats: char.data.stats, stash: char.stash, resists: char.get_resists()});
        }
    }
    
    update_market_info(cell) {
        var data = cell.market.get_orders_list();
        if (constants.logging.sockets.update_market_info) {
            console.log('sending market orders to client');
            console.log(data);
        }
        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1 = char.get_cell();
                    if (i.online & i.market_data & cell1.id==cell.id) {
                        i.socket.emit('market-data', data);
                    }
                } catch(error) {
                    console.log(i.current_user.login);
                }
            }
        }
    }

    send_item_market_update_to_character(character) {
        let market = character.get_cell().item_market;
        let data = market.get_orders_list()
        this.send_to_character_user(character, 'item-market-data', data)
    }

    send_item_market_update(market) {
        let data = market.get_orders_list()
        console.log('update_market_info')
        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1 = char.get_cell();
                    if (i.online & cell1.id==market.cell_id) {
                        i.socket.emit('item-market-data', data)
                    }
                } catch(error) {
                    console.log(i.current_user.login)
                }
            }
        }
    }

    send_market_info(cell) {
        let market = cell.market;

        let data = {
            buy: {},
            sell: {},
            avg: {}
        }

        for (let tag of this.world.constants.TAGS) {
            data.buy[tag] = [];
            data.sell[tag] = []
            for (let i of market.buy_orders[tag].values()) {
                let order = this.world.get_order(i);
                data.buy[tag].push(order.get_json());
            }
            for (let i of market.sell_orders[tag].values()) {
                let order = this.world.get_order(i);
                data.sell[tag].push(order.get_json());
            }
            data.avg[tag] = market.guess_tag_cost(tag, 1)
        }
        
        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1 = char.get_cell();
                    if (i.online & i.market_data & cell1.id==cell.id) {
                        i.socket.emit('market-data', data)
                    }
                } catch(error) {
                    console.log(i.current_user.login)
                }
                
            }
        }
    }

    send_all_market_info() {
        for (let i = 0; i < this.world.x; i++) {
            for (let j = 0; j < this.world.y; j++) {
                this.send_market_info(this.world.entity_manager.map.cells[i][j]);
            }
        }
    }

    send_teacher_info(character) {
        let cell = character.get_cell();
        let res = this.world.get_cell_teacher(cell.i, cell.j);
        this.send_to_character_user(character, 'local-skills', res)
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

    async battle_action(socket, user_data, action) {
        if (user_data.current_user != null && user_data.current_user.character.in_battle()) {
            let char = user_data.current_user.character;
            let battle = this.world.get_battle_from_id(char.data.battle_id);
            battle.push_action(char.data.index_in_battle, action)
        }
    }
}
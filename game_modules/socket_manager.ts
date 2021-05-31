import { CharacterGenericPart } from "./base_game_classes/character_generic_part";
import { BattleReworked2 } from "./battle";
import { CharacterAction, CharacterActionResponce } from "./manager_classes/action_manager";
import { User } from "./user";
import { World } from "./world";

var common = require("./common.js");
var {constants} = require("./static_data/constants.js");
var basic_characters = require("./basic_characters.js");


interface UserData {
    socket: any,
    online: boolean,
    current_user: null|User
    market_data: boolean
}


export class SocketManager {
    pool: any
    world: World
    io: any
    MESSAGES: []
    MESSAGE_ID: number
    sockets: any
    sessions: {[_ in string]: User}

    constructor(pool: any, io: any, world: World) {
        this.world = world;
        this.io = io;
        this.pool = pool;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
        if (pool != undefined) {
            this.real_shit();
        }
        this.sockets = new Set();
        this.sessions = {};
    }

    generate_session(length: number): string {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    real_shit() {
        this.io.on('connection', async (socket: any) => {
            let user = new User(this.world)
            user.set_socket(socket)
            this.sockets.add(user);            
            this.connection(socket)



            socket.on('disconnect', () => this.disconnect(user));        
            socket.on('login', async (msg: any) => this.login(user, msg));
            socket.on('reg', async (msg: any) => this.registration(user, msg));
            socket.on('attack', async (msg: any) => this.attack(user, msg));
            // socket.on('attack-outpost', async (msg: any) => this.attack_local_outpost(user, msg));
            socket.on('buy', async (msg: any) => this.buy(user, msg));
            socket.on('sell', async (msg: any) => this.sell(user, msg));
            // socket.on('up-skill', async (msg: any) => this.up_skill(user, msg));
            // socket.on('set-tactic', async (msg: any) => this.set_tactic(user, msg));
            socket.on('new-message', async (msg: any) => this.send_message(user, msg + ''));
            socket.on('char-info-detailed', () => this.send_char_info(user));
            socket.on('send-market-data', (msg: any) => {user.market_data = msg});
            socket.on('equip', async (msg: any) => this.equip(user, msg));
            socket.on('unequip', async (msg: any) => this.unequip(user, msg));

            socket.on('eat', async () => this.eat(user));
            socket.on('clean', async () => this.clean(user));
            socket.on('rest', async () => this.rest(user));
            socket.on('move', async (msg: any) => this.move(user, msg));
            socket.on('hunt', async () => this.hunt(user))

            socket.on('session', async (msg: any) => this.login_with_session(user, msg));
            socket.on('clear_orders', async () => this.clear_orders(user));
            socket.on('sell-item', async (msg: any) => this.sell_item(user, msg));
            socket.on('buyout', async (msg: any) => this.buyout(user, msg));
            socket.on('cfood', async () => this.craft_food(user));
            // socket.on('cclothes', async () => this.craft_clothes(user));
            // socket.on('ench', async (msg: any) => this.enchant(user));
            socket.on('disench', async (msg: any) => this.disenchant(user, msg));
            socket.on('battle-action', async (msg: any) => this.battle_action(user, msg));
        });
    }

    disconnect(user: User) {
        console.log('user disconnected');
        var user_manager = this.world.user_manager;
        if (user.logged_in) {
            user.logged_in = false;
        }
    }

    async buyout(user: User, msg: string) {
        if (user.logged_in) {
            let character = user.get_character();
            let market = character.get_cell().get_item_market();
            if (market == undefined) return;
            let id = parseInt(msg);
            if (isNaN(id)) {
                return
            }
            await market.buyout(this.pool, character, id)
            this.send_item_market_update_to_character(character);
            this.send_equip_update_to_character(character);
        }
    }

    async equip(user: User, msg: number) {
        if (user.logged_in) {
            let character = user.get_character();
            await character.equip_item(msg);
        }
    }

    async unequip(user:User, msg: string) {
        if (user.logged_in) {
            let character = user.get_character();
            character.unequip_tag(msg);
        }
    }

    async sell_item(user: User, msg: any) {
        if (user.logged_in) {
            let character = user.get_character();
            let ind = parseInt(msg.index);
            let bo = parseInt(msg.buyout_price);
            let sp = parseInt(msg.starting_price);
            if ((isNaN(ind)) || (isNaN(bo)) || (isNaN(sp))) {
                return
            }
            character.sell_item(ind, bo, sp);
            let socket = user.socket;
            this.send_char_info(user);
        }
    }

    async connection(socket: any) {
        console.log('a user connected');
        
        socket.emit('tags', this.world.get_stash_tags_list());
        socket.emit('skill-tags', this.world.constants.SKILLS);
        socket.emit('tags-tactic', {target: ['undefined', 'me', 'closest_enemy'], value_tags: ['undefined', 'hp', 'blood', 'rage'], signs: ['undefined', '>', '>=', '<', '<=', '='], actions: ['undefined', 'attack', 'flee']})
        
        socket.emit('sections', this.world.constants.sections);
        var messages = await this.load_messages_from_database()
        for (let i = 0; i < messages.rows.length; i++) {
            let tmp = messages.rows[i];
            socket.emit('new-message', {id: tmp.id, msg: tmp.message, user: tmp.sender})
        }
    }

    async login_with_session(user: User, session: string) {
        console.log('attempt to login with session')
        if (session in this.sessions) {
            user.init_by_user(this.sessions[session]);
            this.world.user_manager.get_user(user.id).socket = user.socket

            let user_manager = this.world.user_manager;
            user_manager.new_user_online(user);

            user.socket.emit('log-message', 'hello ' + user.login);
            user.socket.emit('is-login-completed', 'ok');
            this.send_battle_data_to_user(user);
            this.send_all(user.get_character());
        } else {
            user.socket.emit('reset_session');
        }
    }

    async login(user: User, data: {login: string, password: string}) {
        console.log('login attempt')
        if (user.logged_in) {
            user.socket.emit('is-login-valid', 'you-are-logged-in');
            return;
        }

        var user_manager = this.world.user_manager
        var error_message = common.validate_creds(data);
        user.socket.emit('is-login-valid', error_message);
        if (error_message != 'ok') {
            return
        }

        var answer = await user_manager.login_player(this.pool, data);
        user.socket.emit('is-login-completed', answer.login_prompt);
        if (answer.login_prompt == 'ok') {
            answer.user.set_socket(user.socket)
            user.init_by_user(answer.user);
            user_manager.new_user_online(user);

            user.socket.emit('log-message', 'hello ' + data.login);
            this.send_battle_data_to_user(answer.user);
            this.send_all(user.get_character());

            let session = this.generate_session(20);
            user.socket.emit('session', session);
            this.sessions[session] = user;

            console.log('user ' + data.login + ' logged in')
        }
    }

    async registration(user: User, data: {login: string, password: string}) {
        console.log('registration attempt')
        if (user.logged_in) {
            user.socket.emit('is-reg-valid', 'you-are-logged-in');
            return;
        }

        var user_manager = this.world.user_manager;
        var error_message = common.validate_creds(data);
        user.socket.emit('is-reg-valid', error_message);
        if (error_message != 'ok') {
            return
        }

        var answer = await user_manager.reg_player(this.pool, data);
        user.socket.emit('is-reg-completed', answer.reg_prompt);
        if (answer.reg_prompt == 'ok') {
            answer.user.set_socket(user.socket)
            user.init_by_user(answer.user);

            user_manager.new_user_online(user);
            user.socket.emit('log-message', 'hello ' + data.login);
            this.send_all(user.get_character());

            let session = this.generate_session(20);
            user.socket.emit('session', session);
            this.sessions[session] = user;

            console.log('user ' + data.login + ' registrated')
        }
    }

    send_all(character:CharacterGenericPart) {
        this.send_to_character_user(character, 'name', character.name);
        this.send_hp_update(character);
        this.send_exp_update(character);
        this.send_status_update(character);
        // this.send_tactics_info(character);
        this.send_savings_update(character);
        this.send_skills_info(character);
        this.send_map_pos_info(character);
        this.send_new_actions(character);
        this.send_item_market_update_to_character(character);
        this.send_explored(character);
        this.send_teacher_info(character);
        let user = character.get_user();
        this.send_char_info(user);
    }

    // actions

    async move(user: User, data: {x: number, y: number}) {
        if (!user.logged_in) {
            return 
        }
        let char = user.get_character();
        let res = await this.world.action_manager.start_action(CharacterAction.MOVE, char, data)
        if (res == CharacterActionResponce.CANNOT_MOVE_THERE) {
            user.socket.emit('alert', 'can\'t go there');
        } else if (res == CharacterActionResponce.IN_BATTLE) {
            user.socket.emit('alert', 'you are in battle');
        }
    }

    // eslint-disable-next-line no-unused-vars
    async attack(user: User, data: any) {
        console.log('attack')
        if (user.logged_in && !user.get_character().in_battle()) {
            let char = user.get_character();
            let battle = await this.world.attack_local_monster(this.pool, char, 1);
            if (battle != undefined) {
                battle.send_data_start()
            }
        }
    }

    // async attack_local_outpost(socket, user_data, data) {
    //     if (user_data.current_user != null && !user_data.current_user.character.in_battle()) {
    //         let char = user_data.current_user.character;
    //         let battle = await char.attack_local_outpost(this.pool);
    //         if (battle != undefined) {
    //             battle.send_data_start()
    //         }
    //     }
    // }

    async clear_orders(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            char.clear_orders();
            this.send_savings_update(char);
            this.send_char_info(user);
        }
    }

    async buy(user: User, msg: any) {
        var flag = common.validate_buy_data(this.world, msg);
        if (isNaN(msg.max_price) || isNaN(msg.money) || isNaN(msg.amount)) {
            return
        }
        if ((user.logged_in) && flag) {
            let char = user.get_character();
            char.buy(msg.tag, msg.amount, msg.money, msg.max_price);
            this.send_savings_update(char);
            this.send_stash_update_to_character(char);
        }
    }

    async sell(user: User, msg: any) {
        var flag = common.validate_sell_data(this.world, msg);
        if (isNaN(msg.amount) || isNaN(msg.price)) {
            return
        }
        if ((user.logged_in) && flag) {
            let char = user.get_character();
            char.sell( msg.tag, msg.amount, msg.price);
            this.send_savings_update(char);
            this.send_stash_update_to_character(char);
        }
    }

    // async up_skill(user, msg) {
    //     if (msg in this.world.constants.SKILLS && user_data.current_user != null) {
    //         let char = user_data.current_user.character;
    //         let result = await char.add_skill(this.pool, msg + '');
    //         if (result != undefined) {
    //             this.send_new_tactic_action(char, result);
    //         }
    //         this.send_skills_info(char);
    //         this.send_tactics_info(char);
    //         this.send_exp_update(char)
    //     }
    // }

    async eat(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.EAT, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'not enough food')
            } else if (res == CharacterActionResponce.IN_BATTLE) {
                user.socket.emit('alert', 'you are in battle')
            }
        }
    }

    async clean(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.CLEAN, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'no water available')
            } else if (res == CharacterActionResponce.IN_BATTLE) {
                user.socket.emit('alert', 'you are in battle')
            }
        }
    }

    async hunt(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.HUNT, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'no prey here')
            } else if (res == CharacterActionResponce.IN_BATTLE) {
                user.socket.emit('alert', 'you are in battle')
            }
        }
    }

    async rest(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'no place to rest here')
            } else if (res == CharacterActionResponce.IN_BATTLE) {
                user.socket.emit('alert', 'you are in battle')
            }
        }
    }

    async craft_food(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.COOK_MEAT, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'no place to rest here')
            } else if (res == CharacterActionResponce.IN_BATTLE) {
                user.socket.emit('alert', 'you are in battle')
            }
        }        
    }

    // async craft_clothes(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await char.craft_clothes(this.pool);
    //         if (res != 'ok') {
    //             user.socket.emit('alert', res);
    //         }
    //     }
    // }

    async enchant(user: User, msg: number) {
        if (user.logged_in) {
            let char = user.get_character();
            // let res = await char.enchant(this.pool, msg);
            // if (res != 'ok') {
            //     socket.emit('alert', res);
            // }
        }
    }

    async disenchant(user: User, msg: number) {
        if (user.logged_in) {
            let char = user.get_character();
            // let res = await char.disenchant(this.pool, msg);
            // if (res != 'ok') {
            //     socket.emit('alert', res);
            // }
        }
    }

    // async set_tactic(user: User, msg: any) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         // await char.set_tactic(this.pool, msg);
    //         this.send_tactics_info(char);
    //     }
    // }

    // information sending

    send_new_tactic_action(character: CharacterGenericPart, action: any) {
        this.send_to_character_user(character, 'new-action', action);
    }

    send_new_actions(character: CharacterGenericPart) {
        let actions = character.get_actions();
        for (let i of actions) {
            this.send_new_tactic_action(character, i);
        }
    }

    send_map_pos_info(character: CharacterGenericPart) {
        let cell_id = character.cell_id;
        let pos = this.world.get_cell_x_y_by_id(cell_id);
        this.send_to_character_user(character, 'map-pos', pos)
    }

    send_skills_info(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'skills', character.skills)
    }

    // send_tactics_info(character) {
    //     // this.send_to_character_user(character, 'tactic', character.data.tactic)
    // }

    send_battle_data_to_user(user: User) {
        let character = user.get_character();
        if (character.in_battle()) {
            let battle = this.world.get_battle_from_id(character.get_battle_id());
            if (battle != null) {
                this.send_to_user(user, 'battle-has-started', battle.get_data());
                this.send_to_user(user, 'battle-action', {action: 'new_turn', target: battle.heap.selected});
                let status = battle.get_status()
                this.send_to_character_user(character, 'enemy-update', status);
            } else {
                character.set_flag('in_battle', false)
            }
            
        }
    }

    send_battle_data_start(battle: BattleReworked2) {
        let units = battle.get_units()
        let data = battle.get_data()
        let status = battle.get_status()
        for (let i in units) {
            let char = this.world.get_character_by_id(units[i].char_id)
            if ((char != undefined) && char.is_player()) {
                this.send_to_character_user(char, 'battle-has-started', data);
                this.send_to_character_user(char, 'enemy-update', status)
            }
        } 
    }

    send_battle_update(battle: BattleReworked2) {
        let units = battle.get_units()
        let status = battle.get_status()
        let data = battle.get_data()
        for (let i in units) {
            let char = this.world.get_character_by_id(units[i].char_id)
            if ((char != undefined) && char.is_player()) {
                this.send_to_character_user(char, 'enemy-update', status)
                this.send_to_character_user(char, 'battle-update', data)
            }
        } 
    }

    send_battle_action(battle: BattleReworked2, a: any) {
        let units = battle.get_units()
        for (let i = 0; i < units.length; i++) {
            let char = this.world.get_character_by_id(units[i].char_id);
            if ((char != undefined) && char.is_player()) {
                this.send_to_character_user(char, 'battle-action', a)
            }
        }
    }

    send_stop_battle(battle: BattleReworked2) {
        let units = battle.get_units()
        for (let i = 0; i < units.length; i++) {
            let character = this.world.get_character_by_id(units[i].char_id);
            if (character != undefined) {
                if (character.is_player()) {
                    this.send_to_character_user(character, 'battle-action', {action: 'stop_battle'});
                    this.send_updates_to_char(character)
                }
            }
        }
    }

    send_message_to_character_user(character: CharacterGenericPart, msg: any) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_message_to_user(user, msg);
    }

    send_to_character_user(character:CharacterGenericPart, tag: string, msg: any) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_to_user(user, tag, msg);
    }

    send_message_to_user(user: User, msg: string) {
        this.send_to_user(user, 'log-message', msg)
    }

    send_to_user(user: User, tag: string, msg: any) {
        user.socket.emit(tag, msg)
    }

    get_user_socket(user: User) {
        return user.socket;
    }

    send_hp_update(character: CharacterGenericPart) {
        this.send_status_update(character)
    }

    send_exp_update(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        // this.send_to_user(user, 'exp', {exp: character.data.exp, mexp: common.get_next_nevel_req(character.data.level), level: character.data.level, points: character.data.skill_points});
    }

    send_savings_update(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        this.send_to_user(user, 'savings', character.savings.get());
    }

    send_status_update(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'status', {c: character.status, m: character.stats.max})
    }

    send_explored(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'explore', character.misc.explored)
    }

    send_updates_to_char(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        let socket = this.get_user_socket(user)
        if (socket != undefined) {
           this.send_char_info(user)
        }
    }

    send_equip_update_to_character(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        let socket = this.get_user_socket(user)
        if (socket != undefined) {
           this.send_equip_update(user)
        }
    }

    send_stash_update_to_character(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        let socket = this.get_user_socket(user)
        if (socket != undefined) {
           this.send_stash_update(user)
        }
    }

    send_char_info(user: User) {
        if (user != null) {
            let char = user.get_character()
            user.socket.emit('char-info-detailed', {
                stats: {
                    phys_power: char.stats.phys_power,
                    magic_power: char.stats.magic_power,
                    movement_speed: char.stats.movement_speed
                },
                resists: char.get_resists()});
            this.send_equip_update(user)
            this.send_stash_update(user)
        }
    }

    send_equip_update(user: User) {
        if (user != null) {
            let char = user.get_character()
            user.socket.emit('equip-update', char.equip.data)
        }
    }
    
    send_stash_update(user: User) {
        if (user != null) {
            let char = user.get_character()
            user.socket.emit('stash-update', char.stash.data)
        }
    }

    update_market_info(market: any) {
        var data = market.get_orders_list();
        let cell = market.get_cell();
        if (constants.logging.sockets.update_market_info) {
            console.log('sending market orders to client');
            console.log(data);
        }
        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1 = char.get_cell();
                    if (i.online & i.market_data && (cell1.id==cell.id)) {
                        i.socket.emit('market-data', data);
                    }
                } catch(error) {
                    console.log(i.current_user.login);
                }
            }
        }
    }

    send_item_market_update_to_character(character: CharacterGenericPart) {
        let market = character.get_cell().get_item_market();
        if (market == undefined) return;
        let data = market.get_orders_list()
        this.send_to_character_user(character, 'item-market-data', data)
    }

    send_item_market_update(market: any) {
        let data = market.get_orders_list()
        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1 = char.get_cell();
                    if (i.online && cell1.id==market.cell_id) {
                        i.socket.emit('item-market-data', data)
                    }
                } catch(error) {
                    console.log(i.current_user.login)
                }
            }
        }
    }

    send_market_info(market: any) {
        let cell: any = market.get_cell()

        let data:any = {
            buy: {},
            sell: {},
            avg: {}
        }

        for (let tag of this.world.get_stash_tags_list()) {
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
                    let cell1: any = char.get_cell();
                    if (i.online && i.market_data && (cell1.id == cell.id)) {
                        i.socket.emit('market-data', data)
                    }
                } catch(error) {
                    console.log(i.current_user.login)
                }
                
            }
        }
    }

    send_all_market_info() {
        for (let market of this.world.entity_manager.markets) {
            this.send_market_info(market)
        }
    }

    send_teacher_info(character: CharacterGenericPart) {
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
    
    async send_message(user: User, msg: string) {
        if (msg.length > 1000) {
            user.socket.emit('new-message', 'message-too-long')
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

    async load_message_to_database(message: {msg: string, user: string}) {
        let res = await common.send_query(this.pool, constants.new_message_query, [message.msg, message.user]);
        await common.send_query(this.pool, constants.clear_old_messages_query, [res.rows[0].id - 50]);
    }

    async load_messages_from_database() {
        var rows = await common.send_query(this.pool, constants.get_messages_query);
        return rows
    }

    async battle_action(user:User, action: any) {
        if (user.logged_in && user.get_character().in_battle()) {
            let char = user.get_character();
            let battle = this.world.get_battle_from_id(char.get_battle_id());
            if (battle != undefined) {
                let res = await battle.process_input(this.pool, char.get_in_battle_id(), action)
                battle.send_action(res)
                battle.send_update()
            }
        }
    }
}
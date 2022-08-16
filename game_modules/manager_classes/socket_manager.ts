import { can_cast_magic_bolt, can_dodge, can_fast_attack, can_push_back, can_shoot, CharacterGenericPart, Perks, perks_list, perk_price, perk_requirement } from "../base_game_classes/character_generic_part";
import { BattleReworked2, flee_chance } from "../battle";
import { CharacterAction, CharacterActionResponce } from "./action_manager";
import { User } from "../user";
import { PgPool, World } from "../world";

var common = require("../common.js");
import {constants} from '../static_data/constants'
import { ARMOUR_TYPE } from "../static_data/item_tags";
import { Cell } from "../cell";
import { MarketOrder, MarketOrderJson, market_order_index } from "../market/market_order.js";
import { materials, material_index, ZAZ } from "./materials_manager";
import { character_to_cook_elodino_probability, character_to_cook_meat_probability } from "../base_game_classes/character_actions/cook_meat";
import { character_to_craft_spear_probability } from "../base_game_classes/character_actions/craft_spear";
import { character_to_hunt_probability } from "../base_game_classes/character_actions/hunt";
import { can_gather_wood } from "../base_game_classes/character_actions/gather_wood";
import { character_to_craft_rat_armour_probability } from "../base_game_classes/character_actions/craft_rat_armour";
import { money } from "../base_game_classes/savings";
import { AuctionManagement, auction_order_id_raw } from "../market/market_items";
import { craft_bone_arrow_probability } from "../base_game_classes/character_actions/craft_bone_spear";
import { roll_affix_armour, roll_affix_weapon } from "../base_game_classes/affix";

interface UserData {
    socket: any,
    online: boolean,
    current_user: null|User
    market_data: boolean
}


export class SocketManager {
    pool: PgPool
    world: World
    io: any
    MESSAGES: []
    MESSAGE_ID: number
    sockets: any
    sessions: {[_ in string]: number}

    constructor(pool: PgPool, io: any, world: World, flag_ready: boolean) {
        this.world = world;
        this.io = io;
        this.pool = pool;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;

        // @ts-ignore: Unreachable code error
        if (((pool != undefined) || (global.flag_nodb)) && (flag_ready)) {
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
            socket.on('attack-character', async (msg: any) => this.attack_character(user, msg));
            // socket.on('attack-outpost', async (msg: any) => this.attack_local_outpost(user, msg));
            socket.on('buy', async (msg: any) => this.buy(user, msg));
            socket.on('sell', async (msg: any) => this.sell(user, msg));
            // socket.on('up-skill', async (msg: any) => this.up_skill(user, msg));
            // socket.on('set-tactic', async (msg: any) => this.set_tactic(user, msg));
            socket.on('new-message', async (msg: any) => this.send_message(user, msg + ''));
            socket.on('char-info-detailed', () => this.send_char_info(user));
            socket.on('send-market-data', (msg: any) => {user.market_data = msg});
            socket.on('equip-armour', async (msg: any) => this.equip_armour(user, msg));
            socket.on('equip-weapon', async (msg: any) => this.equip_weapon(user, msg));
            socket.on('equip-armour', async (msg: any) => this.enchant_armour(user, msg));
            socket.on('equip-weapon', async (msg: any) => this.enchant_weapon(user, msg));
            socket.on('switch-weapon', async (msg: any) => this.switch_weapon(user))
            socket.on('unequip', async (msg: any) => this.unequip(user, msg));

            socket.on('eat', async () => this.eat(user));
            socket.on('clean', async () => this.clean(user));
            socket.on('rest', async () => this.rest(user));
            socket.on('move', async (msg: any) => this.move(user, msg));
            socket.on('hunt', async () => this.hunt(user))
            socket.on('gather_wood', async () => this.gather_wood(user))

            socket.on('session', async (msg: any) => this.login_with_session(user, msg));
            socket.on('clear-orders', async () => this.clear_orders(user));
            socket.on('clear-item-orders', async () => this.clear_item_orders(user))
            socket.on('clear-order', async (msg: any) => this.clear_order(user, msg));
            socket.on('sell-item', async (msg: any) => this.sell_item(user, msg));
            socket.on('buyout', async (msg: any) => this.buyout(user, msg));
            socket.on('execute-order', async (msg: any) => this.execute_order(user, msg.amount, msg.order))
            socket.on('cfood', async () =>      this.craft(user, CharacterAction.COOK_MEAT));
            socket.on('czaz', async () =>       this.craft(user, CharacterAction.COOK_ELODINO));
            socket.on('mspear', async () =>     this.craft(user, CharacterAction.CRAFT_SPEAR))
            socket.on('mbspear', async () =>    this.craft(user, CharacterAction.CRAFT_BONE_SPEAR))
            socket.on('mbow', async () =>       this.craft(user, CharacterAction.CRAFT_WOOD_BOW))
            socket.on('marr', async () =>       this.craft(user, CharacterAction.CRAFT_BONE_ARROW))
            socket.on('mrpants', async () =>    this.craft(user, CharacterAction.CRAFT_RAT_PANTS))
            socket.on('mrgloves', async () =>   this.craft(user, CharacterAction.CRAFT_RAT_GLOVES))
            socket.on('mrboots', async () =>    this.craft(user, CharacterAction.CRAFT_RAT_BOOTS))
            socket.on('mrhelmet', async () =>   this.craft(user, CharacterAction.CRAFT_RAT_HELMET))
            socket.on('mrarmour', async () =>   this.craft(user, CharacterAction.CRAFT_RAT_ARMOUR))
            // socket.on('cclothes', async () => this.craft_clothes(user));
            // socket.on('ench', async (msg: any) => this.enchant(user));
            socket.on('disench', async (msg: any) => this.disenchant(user, msg));
            socket.on('battle-action', async (msg: any) => this.battle_action(user, msg));
            socket.on('req-ranged-accuracy', async (msg: any) => this.send_ranged_accuracy(user, msg))

            socket.on('request-perks', (msg:any) => this.send_perks_info(user, msg))
            socket.on('learn-perk', (msg:any) => this.send_learn_perk_request(user, msg.id, msg.tag))
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
            let id = parseInt(msg);
            if (isNaN(id)) {
                return
            }
            let responce = await AuctionManagement.buyout(this.pool, this.world.entity_manager, this, character, id as auction_order_id_raw)
            this.send_to_character_user(character, 'alert', responce)
            this.send_item_market_update_to_character(character);
            this.send_equip_update_to_character(character);
        }
    }

    async equip_armour(user: User, msg: number) {
        if (user.logged_in) {
            let character = user.get_character();
            await character.equip_armour(msg);
            this.send_equip_update_to_character(character)
        }
    }

    async equip_weapon(user: User, msg: number) {
        if (user.logged_in) {
            // console.log('equip ', msg)
            let character = user.get_character();
            await character.equip_weapon(msg);
            this.send_equip_update_to_character(character)
        }
    }

    async enchant_weapon(user: User, msg: number) {
        if (user.logged_in) {
            let character = user.get_character();
            let item = character.equip.data.backpack.weapons[msg]
            if (item != undefined) {
                if (character.stash.get(ZAZ) > 1) {
                    roll_affix_weapon(character.get_enchant_rating(), item)
                    character.stash.inc(ZAZ, -1)
                    this.send_equip_update_to_character(character)
                    this.send_stash_update_to_character(character)
                } else {
                    this.send_to_character_user(character, 'alert', 'not_enough_zaz')
                }                
            }            
        }
    }

    async enchant_armour(user: User, msg: number) {
        if (user.logged_in) {
            let character = user.get_character();
            let item = character.equip.data.backpack.armours[msg]
            if (item != undefined) {
                if (character.stash.get(ZAZ) > 1) {
                    roll_affix_armour(character.get_enchant_rating(), item)
                    character.stash.inc(ZAZ, -1)
                    this.send_equip_update_to_character(character)
                    this.send_stash_update_to_character(character)
                } else {
                    this.send_to_character_user(character, 'alert', 'not_enough_zaz')
                }                
            }            
        }
    }

    async switch_weapon(user:User) {
        if (user.logged_in) {
            // console.log('equip ', msg)
            let character = user.get_character();
            if (character.in_battle()) {
                user.socket.emit('alert', 'in_battle')
                return
            }
            await character.switch_weapon();
            this.send_equip_update_to_character(character)
        }
    }

    // potential inputs 'right_hand', 'body', 'legs', 'foot', 'head', 'arms'
    async unequip(user:User, msg: string) {
        if (user.logged_in) {
            let character = user.get_character();
            if (msg == "right_hand") {
                character.unequip_weapon()
            } else {
                switch(msg) {
                    case 'secondary': {character.unequip_secondary();break;}
                    case 'body': {character.unequip_armour(ARMOUR_TYPE.BODY);break;}
                    case 'legs': {character.unequip_armour(ARMOUR_TYPE.LEGS);break;}
                    case 'foot': {character.unequip_armour(ARMOUR_TYPE.FOOT);break;}
                    case 'head': {character.unequip_armour(ARMOUR_TYPE.HEAD);break;}
                    case 'arms': {character.unequip_armour(ARMOUR_TYPE.ARMS);break;}
                }
            }
        }
    }

    async sell_item(user: User, msg: any) {
        if (user.logged_in) {
            console.log(msg)
            let character = user.get_character();
            let index = parseInt(msg.index);
            let type = msg.item_type
            let price = parseInt(msg.price);
            if ((type != 'armour') && (type != 'weapon')) return;
            if (isNaN(index) || isNaN(price)) return;
            await AuctionManagement.sell(this.pool, this.world.entity_manager, this, character, type, index, price as money, price as money)
            this.send_char_info(user);
        }
    }

    async connection(socket: any) {
        console.log('a user connected');
        
        socket.emit('tags', this.world.get_materials_json());
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
            user.init_by_user_id(this.sessions[session]);
            this.world.user_manager.get_user(user.id).socket = user.socket

            let user_manager = this.world.user_manager;
            user_manager.new_user_online(user);

            user.socket.emit('log-message', 'hello ' + user.login);
            this.world.user_manager.get_user(user.id).socket.emit('log-message', 'session hello ' + user.login)
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
            user.init_by_user_data(answer.user);
            user_manager.new_user_online(user);

            user.socket.emit('log-message', 'hello ' + data.login);
            this.send_battle_data_to_user(answer.user);
            this.send_all(user.get_character());

            let session = this.generate_session(20);
            user.socket.emit('session', session);
            this.sessions[session] = user.id;

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
            user.init_by_user_data(answer.user);

            user_manager.new_user_online(user);
            user.socket.emit('log-message', 'hello ' + data.login);
            this.send_all(user.get_character());

            let session = this.generate_session(20);
            user.socket.emit('session', session);
            this.sessions[session] = user.id;

            console.log('user ' + data.login + ' registered')
        }
    }

    send_all(character:CharacterGenericPart) {
        console.log('SENDING ALL TO USER')
        this.send_to_character_user(character, 'name', character.name);
        this.send_hp_update(character);
        this.send_exp_update(character);
        this.send_status_update(character);
        // this.send_tactics_info(character);
        this.send_savings_update(character);
        this.send_skills_info(character);
        this.send_map_pos_info(character, true);
        this.send_new_actions(character);
        this.send_item_market_update_to_character(character);
        this.send_explored(character);
        this.send_teacher_info(character);
        let user = character.get_user();
        

        this.send_char_info(user);

        let cell = this.world.entity_manager.get_cell_by_id(character.cell_id)
        if (cell != undefined) {
            this.send_cell_updates(cell)
            this.send_market_info_character(cell, character)
        }
        


        for (let i = 0; i < character.misc.explored.length; i++) {
            if (character.misc.explored[i]) {
                let cell = this.world.get_cell_by_id(i)
                if (cell != undefined) {
                    let x = cell.i
                    let y = cell.j
                    let data: any = this.world.constants.development
                    let res1: any = {}
                    res1[x + '_' + y] = data[x + '_' + y]
                    if (data[x + '_' + y] != undefined) {
                        this.send_to_character_user(character, 'map-data-cells', res1)
                    }

                    if (this.world.constants.terrain[x] != undefined && this.world.constants.terrain[x][y] != undefined) {
                        let res2 = {x: x, y: y, ter: this.world.constants.terrain[x][y]}
                        this.send_to_character_user(character, 'map-data-terrain', res2)
                    }
                }
            }            
        }

        this.send_to_character_user(character, 'b-action-chance', {tag: 'end_turn', value: 1})
        this.send_to_character_user(character, 'b-action-chance', {tag: 'move', value: 1})

        // user.socket.emit('map-data-cells', this.world.constants.development)
        // user.socket.emit('map-data-terrain', this.world.constants.terrain)
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
        console.log('attack random enemy')
        if (user.logged_in && !user.get_character().in_battle()) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.ATTACK, char, undefined)
            if (res == CharacterActionResponce.OK) {
                let battle_id = char.get_battle_id()
                let battle = this.world.get_battle_from_id(battle_id)
                if (battle != undefined) {
                    console.log('battle had started')
                    battle.send_data_start()
                }
            } else if (res == CharacterActionResponce.NO_POTENTIAL_ENEMY) {
                user.socket.emit('alert', 'No enemies')
            }
        }
    }

    //data is a raw id of character
    async attack_character(user: User, data: any) {
        console.log('attack_character')
        
        if (user.logged_in && !user.get_character().in_battle()) {
            
            data = Number(data)

            if (!(data as number in this.world.entity_manager.chars)) {
                return
            }

            let target_character = this.world.get_char_from_id(data as number)
            let char = user.get_character();

            if (target_character.id == char.id) {
                return
            }

            if (target_character.in_battle()) {
                return
            }

            if (target_character.cell_id != char.cell_id) {
                return
            }

            let battle = await this.world.create_battle(this.pool, [char], [target_character])

            if (battle != undefined) {
                console.log('battle had started')
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
            await this.world.entity_manager.remove_orders(this.pool, char)
            this.send_savings_update(char);
            this.send_stash_update(user);
            this.send_char_info(user);
        }
    }

    async clear_item_orders(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            await AuctionManagement.cancel_all_orders(this.pool, this.world.entity_manager, this, char)
            this.send_stash_update(user);
            this.send_char_info(user);
        }
    }

    async clear_order(user: User, data: number) {
        if (user.logged_in) {
            let char = user.get_character();
            let order = this.world.entity_manager.orders[data]
            if (order.owner_id != char.id) {
                user.socket.emit('alert', 'not your order')
                return
            }
            await this.world.entity_manager.remove_order(this.pool, data as market_order_index)
            this.send_savings_update(char);
            this.send_stash_update(user);
            this.send_char_info(user);
        }
    }

    async execute_order(user: User, amount: number, order_id: market_order_index) {
        if (user.logged_in) {
            let character = user.get_character()
            let cell = character.get_cell()
            if (cell == undefined) {
                return
            }
            if (cell.orders.has(order_id)) {
                let order = this.world.get_order(order_id)
                let responce = 'ok'
                if (order.typ == 'buy') {
                    responce = await cell.execute_buy_order(this.pool, order_id, amount, character)
                    this.send_savings_update(character)
                    let own = order.owner
                    if (own != undefined) {
                        this.send_stash_update_to_character(own)
                    }
                }
                if (order.typ == 'sell') {
                    responce = await cell.execute_sell_order(this.pool, order_id, amount, character)
                    this.send_stash_update_to_character(character)
                    let own = order.owner
                    if (own != undefined) {
                        this.send_savings_update(own)                        
                    }
                }

                this.send_market_info(cell)

                user.socket.emit('alert', responce)
            } else {
                user.socket.emit('alert', 'Selected order does not exists')
            }
        }
    }

    async buy(user: User, msg: any) {
        console.log('buy')
        console.log(msg)
        if (isNaN(msg.price)) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        msg.price = Math.floor(msg.price)
        if (msg.price < 0) {
            user.socket.emit('alert', 'invalid_price')
        }
        

        if (isNaN(msg.amount)) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        msg.amount = Math.floor(msg.amount)
        if (msg.amount <= 0) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }


        if (isNaN(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }
        msg.material = Math.floor(msg.material)
        if (!materials.validate_material(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }


        if ((user.logged_in)) {
            let char = user.get_character();
            let responce = await char.buy(this.pool, msg.material as material_index, msg.amount, msg.price)
            if (responce != 'ok') {
                user.socket.emit('alert', responce)
                return
            }
            this.send_savings_update(char);
            this.send_stash_update_to_character(char);
            let cell = char.get_cell()
            if (cell != undefined) {
                this.send_market_info(cell)
            }
        }
    }

    async sell(user: User, msg: any) {
        console.log('sell')
        console.log(msg)
        if (isNaN(msg.price)) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        msg.price = Math.floor(msg.price)
        if (msg.price < 0) {
            user.socket.emit('alert', 'invalid_price')
            return
        }
        

        if (isNaN(msg.amount)) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }
        msg.amount = Math.floor(msg.amount)
        if (msg.amount <= 0) {
            user.socket.emit('alert', 'invalid_amount')
            return
        }


        if (isNaN(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }
        msg.material = Math.floor(msg.material)
        if (!materials.validate_material(msg.material)) {
            user.socket.emit('alert', 'invalid_material')
            return
        }


        if ((user.logged_in)) {
            let char = user.get_character();
            let responce = await char.sell(this.pool, msg.material as material_index, msg.amount, msg.price)
            if (responce != 'ok') {
                user.socket.emit('alert', responce)
                return
            }

            this.send_savings_update(char);
            this.send_stash_update_to_character(char);
            let cell = char.get_cell()
            if (cell != undefined) {
                this.send_market_info(cell)
            }
            user.socket.emit('alert', responce)
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

    async gather_wood(user: User) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(CharacterAction.GATHER_WOOD, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'no wood here')
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


    async craft(user: User, craft_action: CharacterAction) {
        if (user.logged_in) {
            let char = user.get_character();
            let res = await this.world.action_manager.start_action(craft_action, char, undefined)
            if (res == CharacterActionResponce.NO_RESOURCE)  {
                user.socket.emit('alert', 'not enough resources')
            } else if (res == CharacterActionResponce.IN_BATTLE) {
                user.socket.emit('alert', 'you are in battle')
            } else if (res == CharacterActionResponce.FAILED) {
                user.socket.emit('alert', 'failed')
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

    send_map_pos_info(character: CharacterGenericPart, teleport_flag:boolean) {
        let cell_id = character.cell_id;
        let pos = this.world.get_cell_x_y_by_id(cell_id);
        let data = {x:pos.x,y:pos.y,teleport_flag:teleport_flag}
        this.send_to_character_user(character, 'map-pos', data)
    }

    send_skills_info(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'skills', character.skills)
        this.send_to_character_user(character, 'craft-probability', {tag: 'cook_meat', value: character_to_cook_meat_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_spear', value: character_to_craft_spear_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_bone_spear', value: character_to_craft_spear_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_rat_pants', value: character_to_craft_rat_armour_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_rat_armour', value: character_to_craft_rat_armour_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_rat_gloves', value: character_to_craft_rat_armour_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_rat_helmet', value: character_to_craft_rat_armour_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_rat_boots', value: character_to_craft_rat_armour_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'cook_elodino', value: character_to_cook_elodino_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_wood_bow', value: character_to_craft_spear_probability(character)})
        this.send_to_character_user(character, 'craft-probability', {tag: 'craft_bone_arrow', value: craft_bone_arrow_probability(character)})
        

        this.send_to_character_user(character, 'cell-action-chance', {tag: 'hunt', value: character_to_hunt_probability(character)})
        this.send_to_character_user(character, 'b-action-chance', {tag: 'flee', value: flee_chance(character)})
        this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
        this.send_perk_related_skills_update(character)
    }

    send_perk_related_skills_update(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'b-action-chance', {tag: 'fast_attack', value: character.get_attack_chance('fast')})
        this.send_to_character_user(character, 'b-action-chance', {tag: 'push_back', value: character.get_attack_chance('heavy')})
        this.send_to_character_user(character, 'b-action-chance', {tag: 'magic_bolt', value: 1})

        this.send_to_character_user(character, 'action-display', {tag: 'dodge', value: can_dodge(character)})
        this.send_to_character_user(character, 'action-display', {tag: 'fast_attack', value: can_fast_attack(character)})
        this.send_to_character_user(character, 'action-display', {tag: 'push_back', value: can_push_back(character)})
        this.send_to_character_user(character, 'action-display', {tag: 'magic_bolt', value: can_cast_magic_bolt(character)})
    }

    // send_tactics_info(character) {
    //     // this.send_to_character_user(character, 'tactic', character.data.tactic)
    // }

    send_battle_data_to_user(user: User) {
        let character = user.get_character();
        if (character.in_battle()) {
            let battle = this.world.get_battle_from_id(character.get_battle_id());
            if (battle != null) {
                
                let position = character.get_in_battle_id()

                this.send_to_character_user(character, 'player-position', position)
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
        console.log('sending battle info')
        let units = battle.get_units()
        let data = battle.get_data()
        let status = battle.get_status()
        for (let i in units) {
            let char = this.world.get_character_by_id(units[i].char_id)
            if ((char != undefined) && char.is_player()) {
                let position = char.get_in_battle_id()
                this.send_to_character_user(char, 'battle-has-started', data);
                this.send_to_character_user(char, 'enemy-update', status)
                this.send_to_character_user(char, 'player-position', position)
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
                // this.send_to_character_user(char, 'player-position', position)
            }
        } 
    }

    send_ranged_accuracy(user:User, distance: number) {
        if (!user.logged_in) {
            return 
        }
        if (isNaN(distance)) {
            return 
        }
        let char = user.get_character()
        this.send_to_character_user(char, 'b-action-chance', {tag: 'shoot', value: char.get_attack_chance('ranged', distance)})
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
                    this.send_to_character_user(character, 'battle-has-ended', '')
                    this.send_updates_to_char(character)
                }
            }
        }
    }

    send_message_to_character_user(character: CharacterGenericPart, msg: any) {
        let user = this.world.user_manager.get_user_from_character(character);
        if (user != undefined) {
            this.send_message_to_user(user, msg);
        }       
    }

    send_to_character_user(character:CharacterGenericPart, tag: string, msg: any) {
        let user = this.world.user_manager.get_user_from_character(character);
        if (user != undefined) {
            this.send_to_user(user, tag, msg);
        }
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
        if (user != undefined) {
            this.send_to_user(user, 'savings', character.savings.get());
            this.send_to_user(user, 'savings-trade', character.trade_savings.get());
        }        
    }

    send_status_update(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'status', {c: character.status, m: character.stats.max})
        this.send_to_character_user(character, 'b-action-chance', {tag: 'attack', value: character.get_attack_chance('usual')})
    }

    send_explored(character: CharacterGenericPart) {
        this.send_to_character_user(character, 'explore', character.misc.explored)
    }

    send_updates_to_char(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        if (user == undefined) {
            return
        }
        let socket = this.get_user_socket(user)
        if (socket != undefined) {
           this.send_char_info(user)
        }
    }

    send_equip_update_to_character(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        if (user == undefined) {
            return
        }
        let socket = this.get_user_socket(user)
        if (socket != undefined) {
           this.send_equip_update(user)
        }
        this.send_perk_related_skills_update(character)
    }

    send_stash_update_to_character(character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        if (user != undefined) {
            let socket = this.get_user_socket(user)
            if (socket != undefined) {
                this.send_stash_update(user)
            }
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
            user.socket.emit('equip-update', char.equip.get_data())
            this.send_to_character_user(char, 'action-display', {tag: 'shoot', value: can_shoot(char)})
            this.send_perk_related_skills_update(char)
        }
    }
    
    send_stash_update(user: User) {
        // console.log("send stash update")
        if (user != null) {
            let char = user.get_character()
            user.socket.emit('stash-update', char.stash.data)
            this.send_to_character_user(char, 'action-display', {tag: 'shoot', value: can_shoot(char)})
            this.send_perk_related_skills_update(char)
        }
    }

    prepare_market_orders(market: Cell) {
        let data = market.orders;

        let orders_array = Array.from(data)
        let responce: MarketOrderJson[] = []
        for (let order_id of orders_array) {
            let order = this.world.get_order(order_id)
            if (order.amount > 0) {
                responce.push(order.get_json())
            }
        }
        // console.log(responce)
        return responce
    }

    update_market_info(market: Cell) {
        // console.log('sending market orders to client');
        let responce = this.prepare_market_orders(market)     

        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1 = char.get_cell();
                    if (i.online & i.market_data && (cell1.id==market.id)) {
                        i.socket.emit('market-data', responce);
                    }
                } catch(error) {
                    console.log(i.current_user.login);
                }
            }
        }
    }

    send_item_market_update_to_character(character: CharacterGenericPart) {
        let data = AuctionManagement.cell_id_to_orders_socket_data_list(this.world.entity_manager, character.cell_id)
        this.send_to_character_user(character, 'item-market-data', data)
    }

    send_item_market_update(cell_id: number) {
        let data = AuctionManagement.cell_id_to_orders_socket_data_list(this.world.entity_manager, cell_id)
        // console.log('updating market at ' + cell_id)
        let cell = this.world.entity_manager.get_cell_by_id(cell_id)
        if (cell == undefined) {
            return
        }

        let characters_list = cell.get_characters_list()
        for (let item of characters_list) {
            let id = item.id
            let character = this.world.entity_manager.chars[id]
            this.send_to_character_user(character, 'item-market-data', data)
        }
    }

    send_market_info(market: Cell) {
        let responce = this.prepare_market_orders(market)
        let list = Array.from(market.characters_list)
        for (let item of list) {
            let character = this.world.get_char_from_id(item)
            this.send_to_character_user(character, 'market-data', responce)
        }
        for (let i of this.sockets) {
            if (i.current_user != null) {
                let char = i.current_user.character;
                try {
                    let cell1: any = char.get_cell();
                    if (i.online && i.market_data && (cell1.id == market.id)) {
                        i.socket.emit('market-data', responce)
                    }
                } catch(error) {
                    console.log(i.current_user.login)
                }
            }
        }
    }

    send_cell_updates(cell: Cell) {
        let characters_list = cell.get_characters_list()
        for (let item of characters_list) {
            let id = item.id
            let character = this.world.entity_manager.chars[id]
            this.send_to_character_user(character, 'cell-characters', characters_list)
            this.send_to_character_user(character, 'map-action-status', {tag: 'hunt', value: cell.can_hunt()})
            this.send_to_character_user(character, 'map-action-status', {tag: 'gather_wood', value: can_gather_wood(cell)})
            this.send_to_character_user(character, 'map-action-status', {tag: 'clean', value: cell.can_clean()})
        }
    }

    send_market_info_character(market: Cell, character: CharacterGenericPart) {
        let user = this.world.user_manager.get_user_from_character(character);
        if (user != undefined) {
            let data = this.prepare_market_orders(market)
        this.send_to_character_user(character, 'market-data', data)
        }
    }

    send_all_market_info() {
        // for (let market of this.world.entity_manager.markets) {
        //     this.send_market_info(market)
        // }
    }

    send_teacher_info(character: CharacterGenericPart) {
        let cell = character.get_cell();
        if (cell != undefined) {
            let res = this.world.get_cell_teacher(cell.i, cell.j);
            this.send_to_character_user(character, 'local-skills', res)
        }        
    }


    send_perks_info(user: User, character_id: number) {
        // console.log('request perks from ' + character_id )
        let character = user.get_character()
        let target_character = this.world.entity_manager.chars[character_id]
        if (target_character == undefined) {
            user.socket.emit('alert', 'character does not exist')
            return
        }
        if (character == undefined) {
            user.socket.emit('alert', 'your character does not exist')
            return
        }
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell')
            return
        }

        let data = target_character.skills.perks
        let responce:{[_ in Perks]?: number} = {}
        for (let i of perks_list) {
            if (data[i] == true) {
                responce[i] = perk_price(i)
            }
        }
        
        user.socket.emit('perks-info', responce)
    }

    send_learn_perk_request(user: User, character_id: number, perk_tag:Perks) {
        let character = user.get_character()
        let target_character = this.world.entity_manager.chars[character_id]
        if (target_character == undefined) {
            return
        }
        if (character == undefined) {
            return
        }
        if (character.cell_id != target_character.cell_id) {
            user.socket.emit('alert', 'not in the same cell')
            return
        }
        if (target_character.skills.perks[perk_tag] != true) {
            user.socket.emit('alert', "target doesn't know this perk")
            return
        }

        {
            let savings = character.savings.get()
            let price = perk_price(perk_tag) as money
            if (savings < price) {
                user.socket.emit('alert', 'not enough money')
                return
            }
            
            let responce = perk_requirement(perk_tag, character)
            if (responce != 'ok') {
                user.socket.emit('alert', responce)
                return
            } 

            character.savings.transfer(target_character.savings, price)
            character.learn_perk(perk_tag)
            user.socket.emit('perk learnt')
            this.send_skills_info(character)
        }
    }


    update_user_list(){
        var tmp: number[] = [];
        var users_online = this.world.user_manager.users_online;
        for (var user of this.world.user_manager.users) {
            if (user != undefined) {
                if (users_online[user.id]) {
                    tmp.push(user.id);
                }
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
         // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            return
        }
        let res = await common.send_query(this.pool, constants.new_message_query, [message.msg, message.user]);
        await common.send_query(this.pool, constants.clear_old_messages_query, [res.rows[0].id - 50]);
    }

    async load_messages_from_database() {
        // @ts-ignore: Unreachable code error
        if (global.flag_nodb) {
            return {rows: []}
        }
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
                this.send_skills_info(char)
            }
        }
    }

    send_action_ping_to_character(char: CharacterGenericPart, duration: number, is_move: boolean) {
        this.send_to_character_user(char, 'action-ping', {tag: 'start', time: duration, is_move: is_move})
    }
}
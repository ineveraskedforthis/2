import { SocketWrapper } from "./user";

import { materials } from "../manager_classes/materials_manager";
import { io_type, Socket } from "../../server";
import { UserManagement} from "./user_manager";
import { SKILLS } from "../static_data/skills";
import { SECTIONS } from "../static_data/map_definitions";
import { Auth } from "./network_actions/auth";
import { ValidatorSM } from "./network_actions/common_validations";
import { Alerts } from "./network_actions/alerts";
import { MapSystem } from "../map/system";
import { HandleAction } from "./network_actions/actions";
import { CharacterAction } from "../actions/action_manager";


interface Message {
    id: number
    content: string
    sender: string
}



export class SocketManager {
    io: any
    MESSAGES: Message[]
    MESSAGE_ID: number
    active_users: Set<SocketWrapper>
    // sessions: {[_ in string]: number}

    constructor(io: io_type) {
        this.io = io;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
        this.active_users = new Set();

        this.io.on('connection',  (socket: Socket) => {
            let user = new SocketWrapper(socket)

            this.active_users.add(user);
            this.connection(socket)

            socket.on('disconnect', () => this.disconnect(user));        
            socket.on('login',  (msg: any) => Auth.login(user, msg));
            socket.on('reg',  (msg: any) => Auth.register(user, msg));
            socket.on('session',  (msg: any) => Auth.login_with_session(user, msg));

            socket.on('create_character',  (msg:any) => this.create_character(user, msg));


            // socket.on('attack',  (msg: any) => this.attack(user, msg));
            // socket.on('attack-character',  (msg: any) => this.attack_character(user, msg));

            // socket.on('buy',  (msg: any) => this.buy(user, msg));
            // socket.on('sell',  (msg: any) => this.sell(user, msg));

            // socket.on('new-message',  (msg: any) => this.send_message(user, msg + ''));
            // socket.on('char-info-detailed', () => this.send_char_info(user));
            // socket.on('send-market-data', (msg: any) => {user.market_data = msg});


            // socket.on('equip-armour',  (msg: any) => this.equip_armour(user, msg));
            // socket.on('equip-weapon',  (msg: any) => this.equip_weapon(user, msg));
            // socket.on('enchant-armour',  (msg: any) => this.enchant_armour(user, msg));
            // socket.on('enchant-weapon',  (msg: any) => this.enchant_weapon(user, msg));
            // socket.on('switch-weapon',  (msg: any) => this.switch_weapon(user))
            // socket.on('unequip',  (msg: any) => this.unequip(user, msg));


            socket.on('eat',  () =>             HandleAction.act(user, CharacterAction.GATHER_WOOD));
            socket.on('clean',  () =>           HandleAction.act(user, CharacterAction.CLEAN));
            socket.on('rest',  () =>            HandleAction.act(user, CharacterAction.REST));
            socket.on('move', (msg: any) =>     HandleAction.move(user, msg));
            socket.on('hunt',  () =>            HandleAction.act(user, CharacterAction.HUNT))
            socket.on('gather_wood', () =>      HandleAction.act(user, CharacterAction.GATHER_WOOD))            
            

            // socket.on('clear-orders',  () => this.clear_orders(user));
            // socket.on('clear-item-orders',  () => this.clear_item_orders(user))
            // socket.on('clear-order',  (msg: any) => this.clear_order(user, msg));
            // socket.on('sell-item',  (msg: any) => this.sell_item(user, msg));
            // socket.on('buyout',  (msg: any) => this.buyout(user, msg));
            // socket.on('execute-order',  (msg: any) => this.execute_order(user, msg.amount, msg.order))


            socket.on('cfood',  () =>      HandleAction.act(user, CharacterAction.COOK.MEAT));
            socket.on('czaz',  () =>       HandleAction.act(user, CharacterAction.COOK.ELODINO));
            socket.on('mspear', () =>      HandleAction.act(user, CharacterAction.CRAFT.SPEAR))
            socket.on('mbspear',  () =>    HandleAction.act(user, CharacterAction.CRAFT.BONE_SPEAR))
            socket.on('mbow',  () =>       HandleAction.act(user, CharacterAction.CRAFT.WOOD_BOW))
            socket.on('marr',  () =>       HandleAction.act(user, CharacterAction.CRAFT.BONE_ARROW))
            socket.on('mrpants',  () =>    HandleAction.act(user, CharacterAction.CRAFT.RAT_PANTS))
            socket.on('mrgloves',  () =>   HandleAction.act(user, CharacterAction.CRAFT.RAT_GLOVES))
            socket.on('mrboots',  () =>    HandleAction.act(user, CharacterAction.CRAFT.RAT_BOOTS))
            socket.on('mrhelmet',  () =>   HandleAction.act(user, CharacterAction.CRAFT.RAT_HELMET))
            socket.on('mrarmour',  () =>   HandleAction.act(user, CharacterAction.CRAFT.RAT_ARMOUR))

            // socket.on('disench',  (msg: any) => this.disenchant(user, msg));
            // socket.on('battle-action',  (msg: any) => this.battle_action(user, msg));
            // socket.on('req-ranged-accuracy',  (msg: any) => this.send_ranged_accuracy(user, msg))

            // socket.on('request-perks', (msg:any) => this.send_perks_info(user, msg))
            // socket.on('learn-perk', (msg:any) => this.send_learn_perk_request(user, msg.id, msg.tag))
        });
    }

    

    disconnect(user: SocketWrapper) {
        console.log('user disconnected');
        UserManagement.log_out(user)
    }

    connection(socket: Socket) {
        console.log('a user connected');
        
        socket.emit('tags', materials.get_materials_json());
        socket.emit('skill-tags', SKILLS);        
        socket.emit('sections', SECTIONS);
        
        var messages = this.MESSAGES
        for (let message of messages) {
            socket.emit('new-message', {id: message.id, msg: message.content, user: message.sender})
        }
    }

    create_character(sw: SocketWrapper, data: {name: string, eyes: number, chin: number, mouth: number, location: string}) {
        if (sw.user_id == '#') return
        let user = UserManagement.get_user(sw.user_id)

        if (!ValidatorSM.isAlphaNum(data.name)) Alerts.generic_user_alert(user, 'alert', 'character is not allowed')
        let model_variation:any = {
            eyes: data.eyes,
            chin: data.chin,
            mouth: data.mouth
        }

        if (data.location == 'village') {var starting_cell = MapSystem.coordinate_to_id(7, 5)}
        else                            {var starting_cell = MapSystem.coordinate_to_id(7, 5)}

        UserManagement.get_new_character(sw.user_id, data.name, model_variation, starting_cell)
        UserManagement.update_users()
    }

    // send_all(character:Character) {
    //     console.log('SENDING ALL TO USER')
    //     this.send_to_character_user(character, 'name', character.name);
    //     this.send_hp_update(character);
    //     this.send_exp_update(character);
    //     this.send_status_update(character);
    //     // this.send_tactics_info(character);
    //     this.send_savings_update(character);
    //     this.send_skills_info(character);
    //     this.send_map_pos_info(character, true);
    //     this.send_new_actions(character);
    //     this.send_item_market_update_to_character(character);
    //     this.send_explored(character);
    //     this.send_teacher_info(character);
    //     let user = character.get_user();
        

    //     this.send_char_info(user);

    //     let cell = this.world.entity_manager.get_cell_by_id(character.cell_id)
    //     if (cell != undefined) {
    //         this.send_cell_updates(cell)
    //         this.send_market_info_character(cell, character)
    //     }
        





    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'end_turn', value: 1})
    //     this.send_to_character_user(character, 'b-action-chance', {tag: 'move', value: 1})


    // }

    // // actions



    // // eslint-disable-next-line no-unused-vars
    //  attack(user: User, data: any) {
    //     console.log('attack random enemy')
    //     if (user.logged_in && !user.get_character().in_battle()) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(CharacterAction.ATTACK, char, undefined)
    //         if (res == CharacterActionResponce.OK) {
    //             let battle_id = char.get_battle_id()
    //             let battle = this.world.get_battle_from_id(battle_id)
    //             if (battle != undefined) {
    //                 console.log('battle had started')
    //                 battle.send_data_start()
    //             }
    //         } else if (res == CharacterActionResponce.NO_POTENTIAL_ENEMY) {
    //             user.socket.emit('alert', 'No enemies')
    //         }
    //     }
    // }

    // //data is a raw id of character
    //  attack_character(user: User, data: any) {
    //     console.log('attack_character')
        
    //     if (user.logged_in && !user.get_character().in_battle()) {
            
    //         data = Number(data)

    //         if (!(data as number in this.world.entity_manager.chars)) {
    //             return
    //         }

    //         let target_character = this.world.get_char_from_id(data as number)
    //         let char = user.get_character();

    //         if (target_character.id == char.id) {
    //             return
    //         }

    //         if (target_character.in_battle()) {
    //             return
    //         }

    //         if (target_character.cell_id != char.cell_id) {
    //             return
    //         }

    //         let battle = await this.world.create_battle(this.pool, [char], [target_character])

    //         if (battle != undefined) {
    //             console.log('battle had started')
    //             battle.send_data_start()
    //         }
    //     }
    // }

    // //  attack_local_outpost(socket, user_data, data) {
    // //     if (user_data.current_user != null && !user_data.current_user.character.in_battle()) {
    // //         let char = user_data.current_user.character;
    // //         let battle = await char.attack_local_outpost(this.pool);
    // //         if (battle != undefined) {
    // //             battle.send_data_start()
    // //         }
    // //     }
    // // }

    //  clear_orders(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         await this.world.entity_manager.remove_orders(this.pool, char)
    //         this.send_savings_update(char);
    //         this.send_stash_update(user);
    //         this.send_char_info(user);
    //     }
    // }

    //  clear_item_orders(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         await AuctionManagement.cancel_all_orders(this.pool, this.world.entity_manager, this, char)
    //         this.send_stash_update(user);
    //         this.send_char_info(user);
    //     }
    // }

    //  clear_order(user: User, data: number) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let order = this.world.entity_manager.orders[data]
    //         if (order.owner_id != char.id) {
    //             user.socket.emit('alert', 'not your order')
    //             return
    //         }
    //         await this.world.entity_manager.remove_order(this.pool, data as market_order_index)
    //         this.send_savings_update(char);
    //         this.send_stash_update(user);
    //         this.send_char_info(user);
    //     }
    // }

    //  execute_order(user: User, amount: number, order_id: market_order_index) {
    //     if (user.logged_in) {
    //         let character = user.get_character()
    //         let cell = character.get_cell()
    //         if (cell == undefined) {
    //             return
    //         }
    //         if (cell.orders.has(order_id)) {
    //             let order = this.world.get_order(order_id)
    //             let responce = 'ok'
    //             if (order.typ == 'buy') {
    //                 responce = await cell.execute_buy_order(this.pool, order_id, amount, character)
    //                 this.send_savings_update(character)
    //                 let own = order.owner
    //                 if (own != undefined) {
    //                     this.send_stash_update_to_character(own)
    //                 }
    //             }
    //             if (order.typ == 'sell') {
    //                 responce = await cell.execute_sell_order(this.pool, order_id, amount, character)
    //                 this.send_stash_update_to_character(character)
    //                 let own = order.owner
    //                 if (own != undefined) {
    //                     this.send_savings_update(own)                        
    //                 }
    //             }

    //             this.send_market_info(cell)

    //             user.socket.emit('alert', responce)
    //         } else {
    //             user.socket.emit('alert', 'Selected order does not exists')
    //         }
    //     }
    // }

    //  buy(user: User, msg: any) {
    //     console.log('buy')
    //     console.log(msg)
    //     if (isNaN(msg.price)) {
    //         user.socket.emit('alert', 'invalid_price')
    //         return
    //     }
    //     msg.price = Math.floor(msg.price)
    //     if (msg.price < 0) {
    //         user.socket.emit('alert', 'invalid_price')
    //     }
        

    //     if (isNaN(msg.amount)) {
    //         user.socket.emit('alert', 'invalid_amount')
    //         return
    //     }
    //     msg.amount = Math.floor(msg.amount)
    //     if (msg.amount <= 0) {
    //         user.socket.emit('alert', 'invalid_amount')
    //         return
    //     }


    //     if (isNaN(msg.material)) {
    //         user.socket.emit('alert', 'invalid_material')
    //         return
    //     }
    //     msg.material = Math.floor(msg.material)
    //     if (!materials.validate_material(msg.material)) {
    //         user.socket.emit('alert', 'invalid_material')
    //         return
    //     }


    //     if ((user.logged_in)) {
    //         let char = user.get_character();
    //         let responce = await char.buy(this.pool, msg.material as material_index, msg.amount, msg.price)
    //         if (responce != 'ok') {
    //             user.socket.emit('alert', responce)
    //             return
    //         }
    //         this.send_savings_update(char);
    //         this.send_stash_update_to_character(char);
    //         let cell = char.get_cell()
    //         if (cell != undefined) {
    //             this.send_market_info(cell)
    //         }
    //     }
    // }

    //  sell(user: User, msg: any) {
    //     console.log('sell')
    //     console.log(msg)
    //     if (isNaN(msg.price)) {
    //         user.socket.emit('alert', 'invalid_price')
    //         return
    //     }
    //     msg.price = Math.floor(msg.price)
    //     if (msg.price < 0) {
    //         user.socket.emit('alert', 'invalid_price')
    //         return
    //     }
        

    //     if (isNaN(msg.amount)) {
    //         user.socket.emit('alert', 'invalid_amount')
    //         return
    //     }
    //     msg.amount = Math.floor(msg.amount)
    //     if (msg.amount <= 0) {
    //         user.socket.emit('alert', 'invalid_amount')
    //         return
    //     }


    //     if (isNaN(msg.material)) {
    //         user.socket.emit('alert', 'invalid_material')
    //         return
    //     }
    //     msg.material = Math.floor(msg.material)
    //     if (!materials.validate_material(msg.material)) {
    //         user.socket.emit('alert', 'invalid_material')
    //         return
    //     }


    //     if ((user.logged_in)) {
    //         let char = user.get_character();
    //         let responce = await char.sell(this.pool, msg.material as material_index, msg.amount, msg.price)
    //         if (responce != 'ok') {
    //             user.socket.emit('alert', responce)
    //             return
    //         }

    //         this.send_savings_update(char);
    //         this.send_stash_update_to_character(char);
    //         let cell = char.get_cell()
    //         if (cell != undefined) {
    //             this.send_market_info(cell)
    //         }
    //         user.socket.emit('alert', responce)
    //     }
    // }

    // //  up_skill(user, msg) {
    // //     if (msg in this.world.constants.SKILLS && user_data.current_user != null) {
    // //         let char = user_data.current_user.character;
    // //         let result = await char.add_skill(this.pool, msg + '');
    // //         if (result != undefined) {
    // //             this.send_new_tactic_action(char, result);
    // //         }
    // //         this.send_skills_info(char);
    // //         this.send_tactics_info(char);
    // //         this.send_exp_update(char)
    // //     }
    // // }

    //  eat(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(CharacterAction.EAT, char, undefined)
    //         if (res == CharacterActionResponce.NO_RESOURCE)  {
    //             user.socket.emit('alert', 'not enough food')
    //         } else if (res == CharacterActionResponce.IN_BATTLE) {
    //             user.socket.emit('alert', 'you are in battle')
    //         }
    //     }
    // }

    //  clean(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(CharacterAction.CLEAN, char, undefined)
    //         if (res == CharacterActionResponce.NO_RESOURCE)  {
    //             user.socket.emit('alert', 'no water available')
    //         } else if (res == CharacterActionResponce.IN_BATTLE) {
    //             user.socket.emit('alert', 'you are in battle')
    //         }
    //     }
    // }

    //  hunt(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(CharacterAction.HUNT, char, undefined)
    //         if (res == CharacterActionResponce.NO_RESOURCE)  {
    //             user.socket.emit('alert', 'no prey here')
    //         } else if (res == CharacterActionResponce.IN_BATTLE) {
    //             user.socket.emit('alert', 'you are in battle')
    //         }
    //     }
    // }

    //  gather_wood(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(CharacterAction.GATHER_WOOD, char, undefined)
    //         if (res == CharacterActionResponce.NO_RESOURCE)  {
    //             user.socket.emit('alert', 'no wood here')
    //         } else if (res == CharacterActionResponce.IN_BATTLE) {
    //             user.socket.emit('alert', 'you are in battle')
    //         }
    //     }
    // }

    //  rest(user: User) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
    //         if (res == CharacterActionResponce.NO_RESOURCE)  {
    //             user.socket.emit('alert', 'no place to rest here')
    //         } else if (res == CharacterActionResponce.IN_BATTLE) {
    //             user.socket.emit('alert', 'you are in battle')
    //         }
    //     }
    // }


    //  craft(user: User, craft_action: CharacterAction) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         let res = await this.world.action_manager.start_action(craft_action, char, undefined)
    //         if (res == CharacterActionResponce.NO_RESOURCE)  {
    //             user.socket.emit('alert', 'not enough resources')
    //         } else if (res == CharacterActionResponce.IN_BATTLE) {
    //             user.socket.emit('alert', 'you are in battle')
    //         } else if (res == CharacterActionResponce.FAILED) {
    //             user.socket.emit('alert', 'failed')
    //         }
    //     }
    // }

    // //  craft_clothes(user: User) {
    // //     if (user.logged_in) {
    // //         let char = user.get_character();
    // //         let res = await char.craft_clothes(this.pool);
    // //         if (res != 'ok') {
    // //             user.socket.emit('alert', res);
    // //         }
    // //     }
    // // }

    //  enchant(user: User, msg: number) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         // let res = await char.enchant(this.pool, msg);
    //         // if (res != 'ok') {
    //         //     socket.emit('alert', res);
    //         // }
    //     }
    // }

    //  disenchant(user: User, msg: number) {
    //     if (user.logged_in) {
    //         let char = user.get_character();
    //         // let res = await char.disenchant(this.pool, msg);
    //         // if (res != 'ok') {
    //         //     socket.emit('alert', res);
    //         // }
    //     }
    // }

    // //  set_tactic(user: User, msg: any) {
    // //     if (user.logged_in) {
    // //         let char = user.get_character();
    // //         // await char.set_tactic(this.pool, msg);
    // //         this.send_tactics_info(char);
    // //     }
    // // }

    // // information sending

    // send_new_tactic_action(character: Character, action: any) {
    //     this.send_to_character_user(character, 'new-action', action);
    // }

    // send_new_actions(character: Character) {
    //     let actions = character.get_actions();
    //     for (let i of actions) {
    //         this.send_new_tactic_action(character, i);
    //     }
    // }



    // // send_tactics_info(character) {
    // //     // this.send_to_character_user(character, 'tactic', character.data.tactic)
    // // }

    // send_battle_data_to_user(user: User) {
    //     let character = user.get_character();
    //     if (character.in_battle()) {
    //         let battle = this.world.get_battle_from_id(character.get_battle_id());
    //         if (battle != null) {
                
    //             let position = character.get_in_battle_id()

    //             this.send_to_character_user(character, 'player-position', position)
    //             this.send_to_user(user, 'battle-has-started', battle.get_data());
    //             this.send_to_user(user, 'battle-action', {action: 'new_turn', target: battle.heap.selected});
    //             let status = battle.get_status()
    //             this.send_to_character_user(character, 'enemy-update', status);
                
    //         } else {
    //             character.set_flag('in_battle', false)
    //         }
            
    //     }
    // }

    // send_battle_data_start(battle: BattleReworked2) {
    //     console.log('sending battle info')
    //     let units = battle.get_units()
    //     let data = battle.get_data()
    //     let status = battle.get_status()
    //     for (let i in units) {
    //         let char = this.world.get_character_by_id(units[i].char_id)
    //         if ((char != undefined) && char.is_player()) {
    //             let position = char.get_in_battle_id()
    //             this.send_to_character_user(char, 'battle-has-started', data);
    //             this.send_to_character_user(char, 'enemy-update', status)
    //             this.send_to_character_user(char, 'player-position', position)
    //         }
    //     } 
    // }

    // send_battle_update(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     let status = battle.get_status()
    //     let data = battle.get_data()
    //     for (let i in units) {
    //         let char = this.world.get_character_by_id(units[i].char_id)
    //         if ((char != undefined) && char.is_player()) {
    //             this.send_to_character_user(char, 'enemy-update', status)
    //             this.send_to_character_user(char, 'battle-update', data)
    //             // this.send_to_character_user(char, 'player-position', position)
    //         }
    //     } 
    // }



    // send_battle_action(battle: BattleReworked2, a: any) {
    //     let units = battle.get_units()
    //     for (let i = 0; i < units.length; i++) {
    //         let char = this.world.get_character_by_id(units[i].char_id);
    //         if ((char != undefined) && char.is_player()) {
    //             this.send_to_character_user(char, 'battle-action', a)
    //         }
    //     }
    // }

    // send_stop_battle(battle: BattleReworked2) {
    //     let units = battle.get_units()
    //     for (let i = 0; i < units.length; i++) {
    //         let character = this.world.get_character_by_id(units[i].char_id);
    //         if (character != undefined) {
    //             if (character.is_player()) {
    //                 this.send_to_character_user(character, 'battle-action', {action: 'stop_battle'});
    //                 this.send_to_character_user(character, 'battle-has-ended', '')
    //                 this.send_updates_to_char(character)
    //             }
    //         }
    //     }
    // }

    // send_message_to_character_user(character: Character, msg: any) {
    //     let user = this.world.user_manager.get_user_from_character(character);
    //     if (user != undefined) {
    //         this.send_message_to_user(user, msg);
    //     }       
    // }

    // send_to_character_user(character:Character, tag: string, msg: any) {
    //     let user = this.world.user_manager.get_user_from_character(character);
    //     if (user != undefined) {
    //         this.send_to_user(user, tag, msg);
    //     }
    // }

    // send_message_to_user(user: User, msg: string) {
    //     this.send_to_user(user, 'log-message', msg)
    // }

    // send_to_user(user: User, tag: string, msg: any) {
    //     user.socket.emit(tag, msg)
    // }

    // get_user_socket(user: User) {
    //     return user.socket;
    // }

    // send_hp_update(character: Character) {
    //     this.send_status_update(character)
    // }




    // send_updates_to_char(character: Character) {
    //     let user = this.world.user_manager.get_user_from_character(character);
    //     if (user == undefined) {
    //         return
    //     }
    //     let socket = this.get_user_socket(user)
    //     if (socket != undefined) {
    //        this.send_char_info(user)
    //     }
    // }



    // send_char_info(user: User) {
    //     if (user != null) {
    //         let char = user.get_character()
    //         user.socket.emit('char-info-detailed', {
    //             stats: {
    //                 phys_power: char.stats.phys_power,
    //                 magic_power: char.stats.magic_power,
    //                 movement_speed: char.stats.movement_speed
    //             },
    //             resists: char.get_resists()});
    //         this.send_equip_update(user)
    //         this.send_stash_update(user)
    //     }
    // }




    // send_item_market_update(cell_id: number) {
    //     let data = AuctionManagement.cell_id_to_orders_socket_data_list(this.world.entity_manager, cell_id)
    //     // console.log('updating market at ' + cell_id)
    //     let cell = this.world.entity_manager.get_cell_by_id(cell_id)
    //     if (cell == undefined) {
    //         return
    //     }

    //     let characters_list = cell.get_characters_list()
    //     for (let item of characters_list) {
    //         let id = item.id
    //         let character = this.world.entity_manager.chars[id]
    //         this.send_to_character_user(character, 'item-market-data', data)
    //     }
    // }

    // send_market_info(market: Cell) {
    //     let responce = this.prepare_market_orders(market)
    //     let list = Array.from(market.characters_list)
    //     for (let item of list) {
    //         let character = this.world.get_char_from_id(item)
    //         this.send_to_character_user(character, 'market-data', responce)
    //     }
    //     for (let i of this.sockets) {
    //         if (i.current_user != null) {
    //             let char = i.current_user.character;
    //             try {
    //                 let cell1: any = char.get_cell();
    //                 if (i.online && i.market_data && (cell1.id == market.id)) {
    //                     i.socket.emit('market-data', responce)
    //                 }
    //             } catch(error) {
    //                 console.log(i.current_user.login)
    //             }
    //         }
    //     }
    // }





    // send_all_market_info() {
    //     // for (let market of this.world.entity_manager.markets) {
    //     //     this.send_market_info(market)
    //     // }
    // }

    // send_teacher_info(character: Character) {
    //     let cell = character.get_cell();
    //     if (cell != undefined) {
    //         let res = this.world.get_cell_teacher(cell.i, cell.j);
    //         this.send_to_character_user(character, 'local-skills', res)
    //     }        
    // }


    // send_perks_info(user: User, character_id: number) {
    //     // console.log('request perks from ' + character_id )
    //     let character = user.get_character()
    //     let target_character = this.world.entity_manager.chars[character_id]
    //     if (target_character == undefined) {
    //         user.socket.emit('alert', 'character does not exist')
    //         return
    //     }
    //     if (character == undefined) {
    //         user.socket.emit('alert', 'your character does not exist')
    //         return
    //     }
    //     if (character.cell_id != target_character.cell_id) {
    //         user.socket.emit('alert', 'not in the same cell')
    //         return
    //     }

    //     let data = target_character.skills.perks
    //     let responce:{[_ in Perks]?: number} = {}
    //     for (let i of perks_list) {
    //         if (data[i] == true) {
    //             responce[i] = perk_price(i)
    //         }
    //     }
        
    //     user.socket.emit('perks-info', responce)
    // }

    // send_learn_perk_request(user: User, character_id: number, perk_tag:Perks) {
    //     let character = user.get_character()
    //     let target_character = this.world.entity_manager.chars[character_id]
    //     if (target_character == undefined) {
    //         return
    //     }
    //     if (character == undefined) {
    //         return
    //     }
    //     if (character.cell_id != target_character.cell_id) {
    //         user.socket.emit('alert', 'not in the same cell')
    //         return
    //     }
    //     if (target_character.skills.perks[perk_tag] != true) {
    //         user.socket.emit('alert', "target doesn't know this perk")
    //         return
    //     }

    //     {
    //         let savings = character.savings.get()
    //         let price = perk_price(perk_tag) as money
    //         if (savings < price) {
    //             user.socket.emit('alert', 'not enough money')
    //             return
    //         }
            
    //         let responce = perk_requirement(perk_tag, character)
    //         if (responce != 'ok') {
    //             user.socket.emit('alert', responce)
    //             return
    //         } 

    //         character.savings.transfer(target_character.savings, price)
    //         character.learn_perk(perk_tag)
    //         user.socket.emit('perk learnt')
    //         this.send_skills_info(character)
    //     }
    // }


    // update_user_list(){
    //     var tmp: number[] = [];
    //     var users_online = this.world.user_manager.users_online;
    //     for (var user of this.world.user_manager.users) {
    //         if (user != undefined) {
    //             if (users_online[user.id]) {
    //                 tmp.push(user.id);
    //             }
    //         }            
    //     }
    //     this.io.emit('users-online', tmp);
    // }
    
    //  send_message(user: User, msg: string) {
    //     if (msg.length > 1000) {
    //         user.socket.emit('new-message', 'message-too-long')
    //         return
    //     }
    //     // msg = validator.escape(msg)
    //     var id = await this.world.get_new_id(this.pool, 'messages')
    //     var message = {id: id, msg: msg, user: 'аноньчик'};
    //     if (user != null) {
    //         message.user = user.login;
    //     }
    //     await this.load_message_to_database(message);
    //     this.io.emit('new-message', message);
    // }

    //  load_message_to_database(message: {msg: string, user: string}) {
    //      // @ts-ignore: Unreachable code error
    //     if (global.flag_nodb) {
    //         return
    //     }
    //     let res = await common.send_query(this.pool, constants.new_message_query, [message.msg, message.user]);
    //     await common.send_query(this.pool, constants.clear_old_messages_query, [res.rows[0].id - 50]);
    // }

    //  load_messages_from_database() {
    //     // @ts-ignore: Unreachable code error
    //     if (global.flag_nodb) {
    //         return {rows: []}
    //     }
    //     var rows = await common.send_query(this.pool, constants.get_messages_query);
    //     return rows
    // }

    //  battle_action(user:User, action: any) {
    //     if (user.logged_in && user.get_character().in_battle()) {
    //         let char = user.get_character();
    //         let battle = this.world.get_battle_from_id(char.get_battle_id());
    //         if (battle != undefined) {
    //             let res = await battle.process_input(this.pool, char.get_in_battle_id(), action)
    //             battle.send_action(res)
    //             battle.send_update()
    //             this.send_skills_info(char)
    //         }
    //     }
    // }


}
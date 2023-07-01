import { SocketWrapper } from "./user";

import { materials } from "../manager_classes/materials_manager";
import { io_type, Socket } from "../../server";
import { UserManagement} from "./user_manager";
// import { SECTIONS } from "../static_data/map_definitions";
import { Auth } from "./network_actions/auth";
import { Validator } from "./network_actions/common_validations";
import { Alerts } from "./network_actions/alerts";
import { MapSystem } from "../map/system";
import { HandleAction } from "./network_actions/actions";
import { CharacterAction } from "../actions/actions_00";
import { SocketCommand } from "./network_actions/run_event";
import { Convert } from "../systems_communication";
import { ModelVariant, tagModel, tagRACE } from "../types";
import { InventoryCommands } from "./network_actions/inventory_management";
import { Request } from "./network_actions/request";
import { SKILLS } from "../static_data/skills";
import { craft_actions } from "../craft/crafts_storage";
import { Dialog } from "./network_actions/dialog";

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
            socket.on('play',    (msg:any) => this.play(user));


            // socket.on('attack',  (msg: any) => this.attack(user, msg));
            socket.on('attack-character',  (msg: any) => SocketCommand.attack_character(user, msg));
            socket.on('support-character',  (msg: any) => SocketCommand.support_character(user, msg));
            socket.on('rob-character',  (msg: any) => SocketCommand.rob_character(user, msg));

            socket.on('buy',  (msg: any)    =>      InventoryCommands.buy(user, msg));
            socket.on('sell',  (msg: any)   =>      InventoryCommands.sell(user, msg));
            socket.on('sell-item',  (msg: any) =>   InventoryCommands.sell_item(user, msg));

            socket.on('clear-orders',  () =>        InventoryCommands.clear_bulk_orders(user));
            socket.on('clear-item-orders',  () =>   InventoryCommands.clear_item_orders(user))
            socket.on('clear-order',  (msg: any) => InventoryCommands.clear_bulk_order(user, msg));
            // 
            socket.on('buyout',  (msg: any) =>        InventoryCommands.buyout(user, msg));
            socket.on('execute-order',  (msg: any) => InventoryCommands.execute_bulk_order(user, msg.amount, msg.order))


            socket.on('new-message',  (msg: any) => this.send_message(user, msg + ''));
            // socket.on('char-info-detailed', () => this.send_char_info(user));
            // socket.on('send-market-data', (msg: any) => {user.market_data = msg});


            socket.on('equip',  (msg: any) => InventoryCommands.equip(user, msg));

            socket.on('enchant',  (msg: any) => InventoryCommands.enchant(user, msg));
            socket.on('reenchant', (msg: any) => InventoryCommands.reroll_enchant(user, msg))

            socket.on('destroy',  (msg: any) => InventoryCommands.break_item(user, msg));
            // socket.on('disench',  (msg: any) => this.disenchant(user, msg));

            socket.on('switch-weapon',  (msg: any) => {
                InventoryCommands.switch_weapon(user)
                Request.attack_damage(user)
            })
            socket.on('unequip',  (msg: any) =>         InventoryCommands.unequip(user, msg));


            socket.on('eat',  () =>             HandleAction.act(user, CharacterAction.EAT));
            socket.on('clean',  () =>           HandleAction.act(user, CharacterAction.CLEAN));
            socket.on('rest',  () =>            HandleAction.act(user, CharacterAction.REST));
            socket.on('move', (msg: any) =>     HandleAction.move(user, msg));
            socket.on('hunt',  () =>            HandleAction.act(user, CharacterAction.HUNT))
            socket.on('fish',  () =>            HandleAction.act(user, CharacterAction.FISH))
            socket.on('gather_wood', () =>      HandleAction.act(user, CharacterAction.GATHER_WOOD))            
            socket.on('gather_cotton', () =>    HandleAction.act(user, CharacterAction.GATHER_COTTON)) 

            
            socket.on('craft', (msg) => {
                if (typeof(msg) != 'string') return
                HandleAction.act(user, craft_actions[msg])
            })
            
            // socket.on('battle-action',  (msg: any) => HandleAction.battle(user, msg));
            // socket.on('req-ranged-accuracy', (distance: any) => Request.accuracy(user, distance))
            socket.on('req-player-index',   () =>  Request.player_index(user))
            socket.on('req-flee-chance',    () => Request.flee_chance(user))
            socket.on('req-attacks-damage', () => Request.attack_damage(user))
            // socket.on('req-battle-actions', () => Request.battle_actions(user))
            socket.on('req-battle-actions-self', ()=> Request.battle_actions_self(user))
            socket.on('req-battle-actions-unit', (data) => Request.battle_actions_unit(user, data))
            socket.on('req-battle-actions-position', (data) => Request.battle_actions_position(user, data))

            socket.on('battle-action-self',  (msg: any) => HandleAction.battle_self(user, msg))
            socket.on('battle-action-unit',  (msg: any) => HandleAction.battle_unit(user, msg))
            socket.on('battle-action-position', (msg: any) => HandleAction.battle_position(user, msg))

            socket.on('request-talk',   (msg:any) => Dialog.request_greeting(user, msg))
            socket.on('request-local-buildings', (msg:any) => Request.local_buildings(user))
            socket.on('learn-perk',     (msg: undefined|{id: unknown, tag: unknown}) =>
                                            SocketCommand.learn_perk(user, msg))
            socket.on('learn-skill',    (msg: undefined|{id: unknown, tag: unknown}) => 
                                            SocketCommand.learn_skill(user, msg))
            socket.on('buy-plot',       (msg: undefined|{id: unknown}) => 
                                            SocketCommand.buy_plot(user, msg))
            socket.on('create-plot',    () => SocketCommand.create_plot(user))

            
            socket.on('build-building',     (msg: undefined|{id: unknown, type: unknown}) => SocketCommand.develop_plot(user, msg))
            socket.on('change-rent-price',  (msg: undefined|{id: unknown, price: unknown}) => SocketCommand.change_rent_price(user, msg))
            socket.on('rent-room',          (msg: undefined|{id: unknown}) => SocketCommand.rent_room(user, msg))
            socket.on('leave-room',         () => SocketCommand.leave_room(user))
            
            socket.on('repair-building',    (msg: undefined|{id: unknown}) => SocketCommand.repair_building(user, msg))
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
        // socket.emit('sections', SECTIONS);
        
        var messages = this.MESSAGES
        for (let message of messages) {
            socket.emit('new-message', {id: message.id, msg: message.content, user: message.sender})
        }
    }

    create_character(sw: SocketWrapper, data: {name: string, eyes: number, chin: number, mouth: number, faction: string, race: string}) {
        if (sw.user_id == '#') return
        let user = UserManagement.get_user(sw.user_id)

        if (!Validator.isAlphaNum(data.name)) {
            Alerts.generic_user_alert(user, 'alert', 'character name is not allowed')
            return
        }

        if (data.name == '') {
            Alerts.generic_user_alert(user, 'alert', 'character name is not allowed')
            return
        }
        
        let model_variation:ModelVariant = {
            eyes: data.eyes,
            chin: data.chin,
            mouth: data.mouth
        }
        
        console.log(data)
        UserManagement.get_new_character(sw.user_id, data.name, model_variation, data.faction)
        UserManagement.update_users()
    }

    play(sw: SocketWrapper) {
        if (sw.user_id == '#') return
        let user = UserManagement.get_user(sw.user_id)

        if (user.data.char_id == '@') {
            Alerts.generic_user_alert(user, 'no-character', '')
        } else {
            UserManagement.send_character_to_user(user)
        }
    }

    // send_all(character:Character) {
    //     console.log('SENDING ALL TO USER')
    //     this.send_to_character_user(character, 'name', character.get_name());
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
    //         let res =  this.world.action_manager.start_action(CharacterAction.ATTACK, char, undefined)
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

    // 

    // //  attack_local_outpost(socket, user_data, data) {
    // //     if (user_data.current_user != null && !user_data.current_user.character.in_battle()) {
    // //         let char = user_data.current_user.character;
    // //         let battle =  char.attack_local_outpost(this.pool);
    // //         if (battle != undefined) {
    // //             battle.send_data_start()
    // //         }
    // //     }
    // // }






    // //  up_skill(user, msg) {
    // //     if (msg in this.world.constants.SKILLS && user_data.current_user != null) {
    // //         let char = user_data.current_user.character;
    // //         let result =  char.add_skill(this.pool, msg + '');
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
    //         let res =  this.world.action_manager.start_action(CharacterAction.EAT, char, undefined)
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
    //         let res =  this.world.action_manager.start_action(CharacterAction.CLEAN, char, undefined)
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
    //         let res =  this.world.action_manager.start_action(CharacterAction.HUNT, char, undefined)
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
    //         let res =  this.world.action_manager.start_action(CharacterAction.GATHER_WOOD, char, undefined)
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
    //         let res =  this.world.action_manager.start_action(CharacterAction.REST, char, undefined)
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
    //         let res =  this.world.action_manager.start_action(craft_action, char, undefined)
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
    // //         let res =  char.craft_clothes(this.pool);
    // //         if (res != 'ok') {
    // //             user.socket.emit('alert', res);
    // //         }
    // //     }
    // // }



    // //  set_tactic(user: User, msg: any) {
    // //     if (user.logged_in) {
    // //         let char = user.get_character();
    // //         //  char.set_tactic(this.pool, msg);
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
    
    send_message(sw: SocketWrapper, msg: string) {
        if (msg.length > 1000) {
            sw.socket.emit('new-message', 'message-too-long')
            return
        }
        // msg = validator.escape(msg)
        var id =  this.MESSAGE_ID + 1
        var message = {id: id, msg: msg, user: 'аноньчик'};
        const [user, character] = Convert.socket_wrapper_to_user_character(sw)
        if (character != undefined) {
            message.user = character?.name + `(${user.data.login})`;
        }

        this.MESSAGE_ID++
        this.MESSAGES.push({id: message.id, sender: message.user, content: message.msg})

        // this.load_message_to_database(message);
        this.io.emit('new-message', message);
    }

    //  load_message_to_database(message: {msg: string, user: string}) {


    //      // @ts-ignore: Unreachable code error
    //     if (global.flag_nodb) {
    //         return
    //     }
    //     let res =  common.send_query(this.pool, constants.new_message_query, [message.msg, message.user]);
    //      common.send_query(this.pool, constants.clear_old_messages_query, [res.rows[0].id - 50]);
    // }

    //  load_messages_from_database() {


    //     // @ts-ignore: Unreachable code error
    //     if (global.flag_nodb) {
    //         return {rows: []}
    //     }
    //     var rows =  common.send_query(this.pool, constants.get_messages_query);
    //     return rows
    // }




}
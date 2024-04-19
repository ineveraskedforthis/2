import { SocketWrapper } from "./user";
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
import { SendUpdate } from "./network_actions/updates";
import { MaterialConfiguration } from "@content/content";

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
            socket.on('attack-character',  (msg: any)   => SocketCommand.attack_character(user, msg));
            socket.on('support-character',  (msg: any)  => SocketCommand.support_character(user, msg));
            socket.on('rob-character',  (msg: any)      => SocketCommand.rob_character(user, msg));

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


            socket.on('eat',  (msg) =>          InventoryCommands.eat(user, msg));
            socket.on('clean',  () =>           HandleAction.act(user, CharacterAction.CLEAN));
            socket.on('rest',  () =>            HandleAction.act(user, CharacterAction.REST));
            socket.on('move', (msg: any) =>     HandleAction.move(user, msg));
            socket.on('hunt',  () =>            HandleAction.act(user, CharacterAction.HUNT))
            socket.on('fish',  () =>            HandleAction.act(user, CharacterAction.FISH))
            socket.on('gather_wood', () =>      HandleAction.act(user, CharacterAction.GATHER_WOOD))
            socket.on('gather_cotton', () =>    HandleAction.act(user, CharacterAction.GATHER_COTTON))
            socket.on('gather_berries', () =>   HandleAction.act(user, CharacterAction.GATHER_BERRIES))


            socket.on('craft', (msg) => {
                if (typeof(msg) != 'string') return
                HandleAction.act(user, craft_actions[msg])
            })

            // socket.on('battle-action',  (msg: any) => HandleAction.battle(user, msg));
            // socket.on('req-ranged-accuracy', (distance: any) => Request.accuracy(user, distance))
            socket.on('req-player-index',   () =>  Request.player_index(user))
            socket.on('req-flee-chance',    () => Request.flee_chance(user))
            socket.on('req-attacks-damage', () => Request.attack_damage(user))
            socket.on('req-battle-actions-all', () => Request.battle_actions_all(user))
            socket.on('req-battle-actions-self', ()=> Request.battle_actions_self(user))
            socket.on('req-battle-actions-unit', (data) => Request.battle_actions_unit(user, data))
            socket.on('req-battle-actions-position', (data) => Request.battle_actions_position(user, data))
            socket.on('request-battle-data', (data) => Request.battle(user))

            socket.on('battle-action-self',  (msg: any) => HandleAction.battle_self(user, msg))
            socket.on('battle-action-unit',  (msg: any) => HandleAction.battle_unit(user, msg))
            socket.on('battle-action-position', (msg: any) => HandleAction.battle_position(user, msg))

            socket.on('request-talk',   (msg:unknown) => Dialog.request_greeting(user, msg))
            socket.on('request-prices-character',  (msg:unknown) => Dialog.request_prices(user, msg))
            socket.on('request-craft', () => Request.craft_data(user))

            socket.on('request-local-locations', (msg:any) => Request.local_locations(user))
            socket.on('learn-perk',     (msg: undefined|{id: unknown, tag: unknown}) =>
                                            SocketCommand.learn_perk(user, msg))
            socket.on('learn-skill',    (msg: undefined|{id: unknown, tag: unknown}) =>
                                            SocketCommand.learn_skill(user, msg))

            socket.on('request-map', () => Request.map(user))


            // socket.on('buy-plot',       (msg: undefined|{id: unknown}) =>
            //                                 SocketCommand.buy_plot(user, msg))
            // socket.on('create-plot',    () => SocketCommand.create_plot(user))


            // socket.on('build-location',     (msg: undefined|{id: unknown, type: unknown}) => SocketCommand.develop_plot(user, msg))
            // socket.on('change-rent-price',  (msg: undefined|{id: unknown, price: unknown}) => SocketCommand.change_rent_price(user, msg))
            // socket.on('rent-room',          (msg: undefined|{id: unknown}) => SocketCommand.rent_room(user, msg))
            // socket.on('leave-room',         () => SocketCommand.leave_room(user))
            socket.on("enter-location",        (msg: unknown) => {
                SocketCommand.enter_location(user, msg)
            });

            socket.on('repair-location',    (msg: undefined|{id: unknown}) => SocketCommand.repair_location(user, msg))

            socket.on('request-tags', () => {socket.emit('tags', MaterialConfiguration.MATERIAL_FROM_STRING);})

            socket.on('request-belongings', () => Request.belongings(user))
        });
    }



    disconnect(user: SocketWrapper) {
        console.log('user disconnected');
        UserManagement.log_out(user)
    }

    connection(socket: Socket) {
        console.log('a user connected');
        socket.emit('skill-tags', SKILLS);
        // socket.emit('sections', SECTIONS);

        var messages = this.MESSAGES
        for (let message of messages) {
            socket.emit('new-message', {id: message.id, msg: message.content, user: message.sender})
        }
    }

    create_character(sw: SocketWrapper, data: {name: string, eyes: number, chin: number, mouth: number, faction: string, race: string}) {
        if (sw.user_id == undefined) return
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
        if (sw.user_id == undefined) return
        let user = UserManagement.get_user(sw.user_id)

        if (user.data.character_id == '@') {
            Alerts.generic_user_alert(user, 'no-character', '')
        } else {
            UserManagement.send_character_to_user(user)
        }
    }

    send_message(sw: SocketWrapper, msg: string) {
        if (msg.length > 1000) {
            sw.socket.emit('alert', 'message-too-long')
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
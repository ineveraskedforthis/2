"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const user_1 = require("./user");
const user_manager_1 = require("./user_manager");
const content_1 = require("../../.././../game_content/src/content");
const actions_00_1 = require("../actions/actions_00");
const crafts_storage_1 = require("../craft/crafts_storage");
const systems_communication_1 = require("../systems_communication");
const actions_1 = require("./network_actions/actions");
const alerts_1 = require("./network_actions/alerts");
const auth_1 = require("./network_actions/auth");
const common_validations_1 = require("./network_actions/common_validations");
const dialog_1 = require("./network_actions/dialog");
const inventory_management_1 = require("./network_actions/inventory_management");
const request_1 = require("./network_actions/request");
const run_event_1 = require("./network_actions/run_event");
class SocketManager {
    // sessions: {[_ in string]: number}
    constructor(io) {
        this.io = io;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
        this.active_users = new Set();
        this.io.on('connection', (socket) => {
            let user = new user_1.SocketWrapper(socket);
            this.active_users.add(user);
            this.connection(socket);
            socket.on('disconnect', () => this.disconnect(user));
            socket.on('login', (msg) => auth_1.Auth.login(user, msg));
            socket.on('reg', (msg) => auth_1.Auth.register(user, msg));
            socket.on('session', (msg) => auth_1.Auth.login_with_session(user, msg));
            socket.on('create_character', (msg) => this.create_character(user, msg));
            socket.on('play', (msg) => this.play(user));
            // socket.on('attack',  (msg: any) => this.attack(user, msg));
            socket.on('attack-character', (msg) => run_event_1.SocketCommand.attack_character(user, msg));
            socket.on('support-character', (msg) => run_event_1.SocketCommand.support_character(user, msg));
            socket.on('rob-character', (msg) => run_event_1.SocketCommand.rob_character(user, msg));
            socket.on('buy', (msg) => inventory_management_1.InventoryCommands.buy(user, msg));
            socket.on('sell', (msg) => inventory_management_1.InventoryCommands.sell(user, msg));
            socket.on('sell-item', (msg) => inventory_management_1.InventoryCommands.sell_item(user, msg));
            socket.on('clear-orders', () => inventory_management_1.InventoryCommands.clear_bulk_orders(user));
            socket.on('clear-item-orders', () => inventory_management_1.InventoryCommands.clear_item_orders(user));
            socket.on('clear-order', (msg) => inventory_management_1.InventoryCommands.clear_bulk_order(user, msg));
            //
            socket.on('buyout', (msg) => inventory_management_1.InventoryCommands.buyout(user, msg));
            socket.on('execute-order', (msg) => inventory_management_1.InventoryCommands.execute_bulk_order(user, msg.amount, msg.order));
            socket.on('new-message', (msg) => this.send_message(user, msg + ''));
            // socket.on('char-info-detailed', () => this.send_char_info(user));
            // socket.on('send-market-data', (msg: any) => {user.market_data = msg});
            socket.on('equip', (msg) => inventory_management_1.InventoryCommands.equip(user, msg));
            socket.on('enchant', (msg) => inventory_management_1.InventoryCommands.enchant(user, msg));
            socket.on('reenchant', (msg) => inventory_management_1.InventoryCommands.reroll_enchant(user, msg));
            socket.on('destroy', (msg) => inventory_management_1.InventoryCommands.break_item(user, msg));
            // socket.on('disench',  (msg: any) => this.disenchant(user, msg));
            socket.on('switch-weapon', (msg) => {
                inventory_management_1.InventoryCommands.switch_weapon(user);
                request_1.Request.attack_damage(user);
            });
            socket.on('unequip', (msg) => inventory_management_1.InventoryCommands.unequip(user, msg));
            socket.on('eat', (msg) => inventory_management_1.InventoryCommands.eat(user, msg));
            socket.on('clean', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.CLEAN));
            socket.on('rest', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.REST));
            socket.on('move', (msg) => actions_1.HandleAction.move(user, msg));
            socket.on('hunt', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.HUNT));
            socket.on('fish', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.FISH));
            socket.on('gather_wood', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.GATHER_WOOD));
            socket.on('gather_cotton', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.GATHER_COTTON));
            socket.on('gather_berries', () => actions_1.HandleAction.act(user, actions_00_1.CharacterAction.GATHER_BERRIES));
            socket.on('craft', (msg) => {
                if (typeof (msg) != 'string')
                    return;
                actions_1.HandleAction.act(user, crafts_storage_1.craft_actions[msg]);
            });
            // socket.on('battle-action',  (msg: any) => HandleAction.battle(user, msg));
            // socket.on('req-ranged-accuracy', (distance: any) => Request.accuracy(user, distance))
            socket.on('req-player-index', () => request_1.Request.player_index(user));
            socket.on('req-flee-chance', () => request_1.Request.flee_chance(user));
            socket.on('req-attacks-damage', () => request_1.Request.attack_damage(user));
            socket.on('req-battle-actions-all', () => request_1.Request.battle_actions_all(user));
            socket.on('req-battle-actions-self', () => request_1.Request.battle_actions_self(user));
            socket.on('req-battle-actions-unit', (data) => request_1.Request.battle_actions_unit(user, data));
            socket.on('req-battle-actions-position', (data) => request_1.Request.battle_actions_position(user, data));
            socket.on('request-battle-data', (data) => request_1.Request.battle(user));
            socket.on('battle-action-self', (msg) => actions_1.HandleAction.battle_self(user, msg));
            socket.on('battle-action-unit', (msg) => actions_1.HandleAction.battle_unit(user, msg));
            socket.on('battle-action-position', (msg) => actions_1.HandleAction.battle_position(user, msg));
            socket.on('request-talk', (msg) => dialog_1.Dialog.request_greeting(user, msg));
            socket.on('request-prices-character', (msg) => dialog_1.Dialog.request_prices(user, msg));
            socket.on('request-craft', () => request_1.Request.craft_data(user));
            socket.on('request-local-locations', (msg) => request_1.Request.local_locations(user));
            socket.on('learn-perk', (msg) => run_event_1.SocketCommand.learn_perk(user, msg));
            socket.on('learn-skill', (msg) => run_event_1.SocketCommand.learn_skill(user, msg));
            socket.on('request-map', () => request_1.Request.map(user));
            // socket.on('buy-plot',       (msg: undefined|{id: unknown}) =>
            //                                 SocketCommand.buy_plot(user, msg))
            // socket.on('create-plot',    () => SocketCommand.create_plot(user))
            socket.on('build', (msg) => run_event_1.SocketCommand.build(user, msg));
            // socket.on('change-rent-price',  (msg: undefined|{id: unknown, price: unknown}) => SocketCommand.change_rent_price(user, msg))
            // socket.on('rent-room',          (msg: undefined|{id: unknown}) => SocketCommand.rent_room(user, msg))
            // socket.on('leave-room',         () => SocketCommand.leave_room(user))
            socket.on("enter-location", (msg) => {
                run_event_1.SocketCommand.enter_location(user, msg);
            });
            socket.on('repair-location', (msg) => run_event_1.SocketCommand.repair_location(user, msg));
            socket.on('request-tags', () => { socket.emit('tags', content_1.MaterialConfiguration.MATERIAL_FROM_STRING); });
            socket.on('request-belongings', () => request_1.Request.belongings(user));
        });
    }
    disconnect(user) {
        console.log('user disconnected');
        user_manager_1.UserManagement.log_out(user);
    }
    connection(socket) {
        console.log('a user connected');
        var messages = this.MESSAGES;
        for (let message of messages) {
            socket.emit('new-message', { id: message.id, msg: message.content, user: message.sender });
        }
    }
    create_character(sw, data) {
        if (sw.user_id == undefined)
            return;
        let user = user_manager_1.UserManagement.get_user(sw.user_id);
        if (!common_validations_1.Validator.isAlphaNum(data.name)) {
            alerts_1.Alerts.generic_user_alert(user, 'alert', 'character name is not allowed');
            return;
        }
        if (data.name == '') {
            alerts_1.Alerts.generic_user_alert(user, 'alert', 'character name is not allowed');
            return;
        }
        let model_variation = {
            eyes: data.eyes,
            chin: data.chin,
            mouth: data.mouth
        };
        console.log(data);
        user_manager_1.UserManagement.get_new_character(sw.user_id, data.name, model_variation, data.faction);
        user_manager_1.UserManagement.update_users();
    }
    play(sw) {
        if (sw.user_id == undefined)
            return;
        let user = user_manager_1.UserManagement.get_user(sw.user_id);
        if (user.data.character_id == '@') {
            alerts_1.Alerts.generic_user_alert(user, 'no-character', '');
        }
        else {
            user_manager_1.UserManagement.send_character_to_user(user);
        }
    }
    send_message(sw, msg) {
        if (msg.length > 1000) {
            sw.socket.emit('alert', 'message-too-long');
            return;
        }
        // msg = validator.escape(msg)
        var id = this.MESSAGE_ID + 1;
        var message = { id: id, msg: msg, user: 'аноньчик' };
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character != undefined) {
            message.user = character?.name + `(${user.data.login})`;
        }
        this.MESSAGE_ID++;
        this.MESSAGES.push({ id: message.id, sender: message.user, content: message.msg });
        // this.load_message_to_database(message);
        this.io.emit('new-message', message);
    }
}
exports.SocketManager = SocketManager;


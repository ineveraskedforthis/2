"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = void 0;
const user_1 = require("./user");
const materials_manager_1 = require("../manager_classes/materials_manager");
const user_manager_1 = require("./user_manager");
const skills_1 = require("../static_data/skills");
const map_definitions_1 = require("../static_data/map_definitions");
const auth_1 = require("./network_actions/auth");
const common_validations_1 = require("./network_actions/common_validations");
const alerts_1 = require("./network_actions/alerts");
const system_1 = require("../map/system");
const actions_1 = require("./network_actions/actions");
const action_manager_1 = require("../actions/action_manager");
class SocketManager {
    constructor(io) {
        this.io = io;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
        this.active_users = new Set();
        this.sessions = {};
        this.io.on('connection', (socket) => {
            let user = new user_1.SocketWrapper(socket);
            this.active_users.add(user);
            this.connection(socket);
            socket.on('disconnect', () => this.disconnect(user));
            socket.on('login', (msg) => auth_1.Auth.login(user, msg));
            socket.on('reg', (msg) => auth_1.Auth.register(user, msg));
            socket.on('session', (msg) => auth_1.Auth.login_with_session(user, msg));
            socket.on('create_character', (msg) => this.create_character(user, msg));
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
            // socket.on('eat',  () => this.eat(user));
            // socket.on('clean',  () => this.clean(user));
            // socket.on('rest',  () => this.rest(user));
            socket.on('move', (msg) => actions_1.HandleAction.move(user, msg));
            // socket.on('hunt',  () => this.hunt(user))
            socket.on('gather_wood', () => actions_1.HandleAction.act(user, action_manager_1.CharacterAction.GATHER_WOOD));
            // socket.on('clear-orders',  () => this.clear_orders(user));
            // socket.on('clear-item-orders',  () => this.clear_item_orders(user))
            // socket.on('clear-order',  (msg: any) => this.clear_order(user, msg));
            // socket.on('sell-item',  (msg: any) => this.sell_item(user, msg));
            // socket.on('buyout',  (msg: any) => this.buyout(user, msg));
            // socket.on('execute-order',  (msg: any) => this.execute_order(user, msg.amount, msg.order))
            // socket.on('cfood',  () =>      this.craft(user, CharacterAction.COOK_MEAT));
            // socket.on('czaz',  () =>       this.craft(user, CharacterAction.COOK_ELODINO));
            socket.on('mspear', () => actions_1.HandleAction.act(user, action_manager_1.CharacterAction.CRAFT.SPEAR));
            // socket.on('mbspear',  () =>    this.craft(user, CharacterAction.CRAFT_BONE_SPEAR))
            // socket.on('mbow',  () =>       this.craft(user, CharacterAction.CRAFT_WOOD_BOW))
            // socket.on('marr',  () =>       this.craft(user, CharacterAction.CRAFT_BONE_ARROW))
            // socket.on('mrpants',  () =>    this.craft(user, CharacterAction.CRAFT_RAT_PANTS))
            // socket.on('mrgloves',  () =>   this.craft(user, CharacterAction.CRAFT_RAT_GLOVES))
            // socket.on('mrboots',  () =>    this.craft(user, CharacterAction.CRAFT_RAT_BOOTS))
            // socket.on('mrhelmet',  () =>   this.craft(user, CharacterAction.CRAFT_RAT_HELMET))
            // socket.on('mrarmour',  () =>   this.craft(user, CharacterAction.CRAFT_RAT_ARMOUR))
            // socket.on('disench',  (msg: any) => this.disenchant(user, msg));
            // socket.on('battle-action',  (msg: any) => this.battle_action(user, msg));
            // socket.on('req-ranged-accuracy',  (msg: any) => this.send_ranged_accuracy(user, msg))
            // socket.on('request-perks', (msg:any) => this.send_perks_info(user, msg))
            // socket.on('learn-perk', (msg:any) => this.send_learn_perk_request(user, msg.id, msg.tag))
        });
    }
    disconnect(user) {
        console.log('user disconnected');
        user_manager_1.UserManagement.log_out(user);
    }
    connection(socket) {
        console.log('a user connected');
        socket.emit('tags', materials_manager_1.materials.get_materials_json());
        socket.emit('skill-tags', skills_1.SKILLS);
        socket.emit('sections', map_definitions_1.SECTIONS);
        var messages = this.MESSAGES;
        for (let message of messages) {
            socket.emit('new-message', { id: message.id, msg: message.content, user: message.sender });
        }
    }
    create_character(sw, data) {
        if (sw.user_id == '#')
            return;
        let user = user_manager_1.UserManagement.get_user(sw.user_id);
        if (!common_validations_1.ValidatorSM.isAlphaNum(data.name))
            alerts_1.Alerts.generic_user_alert(user, 'alert', 'character is not allowed');
        let model_variation = {
            eyes: data.eyes,
            chin: data.chin,
            mouth: data.mouth
        };
        if (data.location == 'village') {
            var starting_cell = system_1.MapSystem.coordinate_to_id(7, 5);
        }
        else {
            var starting_cell = system_1.MapSystem.coordinate_to_id(7, 5);
        }
        user_manager_1.UserManagement.get_new_character(sw.user_id, data.name, model_variation, starting_cell);
        user_manager_1.UserManagement.update_users();
    }
}
exports.SocketManager = SocketManager;

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
class SocketManager {
    constructor(io) {
        this.io = io;
        this.MESSAGES = [];
        this.MESSAGE_ID = 0;
        this.active_users = new Set();
        this.sessions = {};
        this.io.on('connection', async (socket) => {
            let user = new user_1.SocketWrapper(socket);
            this.active_users.add(user);
            this.connection(socket);
            socket.on('disconnect', () => this.disconnect(user));
            socket.on('login', async (msg) => auth_1.Auth.login(user, msg));
            socket.on('reg', async (msg) => auth_1.Auth.register(user, msg));
            socket.on('session', async (msg) => auth_1.Auth.login_with_session(user, msg));
            socket.on('create_character', async (msg) => this.create_character(user, msg));
            // socket.on('attack', async (msg: any) => this.attack(user, msg));
            // socket.on('attack-character', async (msg: any) => this.attack_character(user, msg));
            // socket.on('buy', async (msg: any) => this.buy(user, msg));
            // socket.on('sell', async (msg: any) => this.sell(user, msg));
            // socket.on('new-message', async (msg: any) => this.send_message(user, msg + ''));
            // socket.on('char-info-detailed', () => this.send_char_info(user));
            // socket.on('send-market-data', (msg: any) => {user.market_data = msg});
            // socket.on('equip-armour', async (msg: any) => this.equip_armour(user, msg));
            // socket.on('equip-weapon', async (msg: any) => this.equip_weapon(user, msg));
            // socket.on('enchant-armour', async (msg: any) => this.enchant_armour(user, msg));
            // socket.on('enchant-weapon', async (msg: any) => this.enchant_weapon(user, msg));
            // socket.on('switch-weapon', async (msg: any) => this.switch_weapon(user))
            // socket.on('unequip', async (msg: any) => this.unequip(user, msg));
            // socket.on('eat', async () => this.eat(user));
            // socket.on('clean', async () => this.clean(user));
            // socket.on('rest', async () => this.rest(user));
            // socket.on('move', async (msg: any) => this.move(user, msg));
            // socket.on('hunt', async () => this.hunt(user))
            // socket.on('gather_wood', async () => this.gather_wood(user))            
            // socket.on('clear-orders', async () => this.clear_orders(user));
            // socket.on('clear-item-orders', async () => this.clear_item_orders(user))
            // socket.on('clear-order', async (msg: any) => this.clear_order(user, msg));
            // socket.on('sell-item', async (msg: any) => this.sell_item(user, msg));
            // socket.on('buyout', async (msg: any) => this.buyout(user, msg));
            // socket.on('execute-order', async (msg: any) => this.execute_order(user, msg.amount, msg.order))
            // socket.on('cfood', async () =>      this.craft(user, CharacterAction.COOK_MEAT));
            // socket.on('czaz', async () =>       this.craft(user, CharacterAction.COOK_ELODINO));
            // socket.on('mspear', async () =>     this.craft(user, CharacterAction.CRAFT_SPEAR))
            // socket.on('mbspear', async () =>    this.craft(user, CharacterAction.CRAFT_BONE_SPEAR))
            // socket.on('mbow', async () =>       this.craft(user, CharacterAction.CRAFT_WOOD_BOW))
            // socket.on('marr', async () =>       this.craft(user, CharacterAction.CRAFT_BONE_ARROW))
            // socket.on('mrpants', async () =>    this.craft(user, CharacterAction.CRAFT_RAT_PANTS))
            // socket.on('mrgloves', async () =>   this.craft(user, CharacterAction.CRAFT_RAT_GLOVES))
            // socket.on('mrboots', async () =>    this.craft(user, CharacterAction.CRAFT_RAT_BOOTS))
            // socket.on('mrhelmet', async () =>   this.craft(user, CharacterAction.CRAFT_RAT_HELMET))
            // socket.on('mrarmour', async () =>   this.craft(user, CharacterAction.CRAFT_RAT_ARMOUR))
            // socket.on('disench', async (msg: any) => this.disenchant(user, msg));
            // socket.on('battle-action', async (msg: any) => this.battle_action(user, msg));
            // socket.on('req-ranged-accuracy', async (msg: any) => this.send_ranged_accuracy(user, msg))
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
            var starting_cell = system_1.MapSystem.coordinate_to_id(0, 3);
        }
        else {
            var starting_cell = system_1.MapSystem.coordinate_to_id(0, 3);
        }
        user_manager_1.UserManagement.get_new_character(sw.user_id, data.name, model_variation, starting_cell);
        user_manager_1.UserManagement.update_users();
    }
}
exports.SocketManager = SocketManager;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCommands = void 0;
const materials_manager_1 = require("../../manager_classes/materials_manager");
const alerts_1 = require("./alerts");
const systems_communication_1 = require("../../systems_communication");
const inventory_events_1 = require("../../events/inventory_events");
const market_1 = require("../../events/market");
var InventoryCommands;
(function (InventoryCommands) {
    function equip(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        inventory_events_1.EventInventory.equip_from_backpack(character, msg);
    }
    InventoryCommands.equip = equip;
    function switch_weapon(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (character.in_battle()) {
            return;
        }
        inventory_events_1.EventInventory.switch_weapon(character);
    }
    InventoryCommands.switch_weapon = switch_weapon;
    // expected inputs 'right_hand', 'body', 'legs', 'foot', 'head', 'arms'
    function unequip(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (msg == "right_hand") {
            inventory_events_1.EventInventory.unequip(character, 'weapon');
        }
        else if (msg == 'secondary') {
            inventory_events_1.EventInventory.unequip_secondary(character);
        }
        else {
            switch (msg) {
                case 'body': {
                    inventory_events_1.EventInventory.unequip(character, 'body');
                    break;
                }
                case 'legs': {
                    inventory_events_1.EventInventory.unequip(character, 'legs');
                    break;
                }
                case 'foot': {
                    inventory_events_1.EventInventory.unequip(character, 'foot');
                    break;
                }
                case 'head': {
                    inventory_events_1.EventInventory.unequip(character, 'head');
                    break;
                }
                case 'arms': {
                    inventory_events_1.EventInventory.unequip(character, 'arms');
                    break;
                }
            }
        }
    }
    InventoryCommands.unequip = unequip;
    // export function enchant_weapon(sw: SocketWrapper, msg: number) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)
    //     let item = character.equip.data.backpack.weapons[msg];
    //     if (item != undefined) {
    //         let REQUIRED_AMOUNT = 1
    //         let AMOUNT = character.stash.get(ZAZ)
    //         if ( AMOUNT >= REQUIRED_AMOUNT) {
    //             roll_affix_weapon(character.get_enchant_rating(), item)
    //             character.stash.inc(ZAZ, -1)
    //         } else {
    //             Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT)
    //         }                
    //     }
    // }
    // export function enchant_armour(sw: SocketWrapper, msg: number) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)
    //     let item = character.equip.data.backpack.armours[msg]
    //     if (item != undefined) {
    //         let REQUIRED_AMOUNT = 1
    //         let AMOUNT = character.stash.get(ZAZ)
    //         if (AMOUNT >= REQUIRED_AMOUNT) {
    //             roll_affix_armour(character.get_enchant_rating(), item)
    //             character.stash.inc(ZAZ, -1)
    //         } else {
    //             Alerts.not_enough_to_user(user, 'zaz', REQUIRED_AMOUNT, AMOUNT)
    //         }                
    //     }            
    // }
    // export function sell_item(sw: SocketWrapper, msg: any) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)
    //     let index = parseInt(msg.index);
    //     let type = msg.item_type
    //     let price = parseInt(msg.price);
    //     if ((type != 'armour') && (type != 'weapon')) return;
    //     if (isNaN(index) || isNaN(price)) return;
    //     AuctionManagement.sell(entity_manager, character, type, index, price as money, price as money)
    // }
    // export function buyout(sw: SocketWrapper, msg: string) {
    //     if (!Validator.valid_user(user)) return false
    //     let character = Convert.user_to_character(user)
    //     // validate that user input is safe
    //     let id = parseInt(msg);
    //     if (isNaN(id)) {
    //         return
    //     }
    //     let responce = AuctionManagement.buyout(entity_manager, character, id as auction_order_id_raw)
    // }
    function buy(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        console.log('buy');
        console.log(msg);
        if (isNaN(msg.price)) {
            user.socket.emit('alert', 'invalid_price');
            return;
        }
        msg.price = Math.floor(msg.price);
        if (msg.price < 0) {
            user.socket.emit('alert', 'invalid_price');
        }
        if (isNaN(msg.amount)) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        msg.amount = Math.floor(msg.amount);
        if (msg.amount <= 0) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        if (isNaN(msg.material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        msg.material = Math.floor(msg.material);
        if (!materials_manager_1.materials.validate_material(msg.material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        let responce = market_1.EventMarket.buy(character, msg.material, msg.amount, msg.price);
        if (responce != 'ok') {
            alerts_1.Alerts.generic_user_alert(user, 'alert', responce);
            return;
        }
    }
    InventoryCommands.buy = buy;
    function sell(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        console.log('sell');
        console.log(msg);
        if (isNaN(msg.price)) {
            user.socket.emit('alert', 'invalid_price');
            return;
        }
        msg.price = Math.floor(msg.price);
        if (msg.price < 0) {
            user.socket.emit('alert', 'invalid_price');
            return;
        }
        if (isNaN(msg.amount)) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        msg.amount = Math.floor(msg.amount);
        if (msg.amount <= 0) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        if (isNaN(msg.material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        msg.material = Math.floor(msg.material);
        if (!materials_manager_1.materials.validate_material(msg.material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        let responce = market_1.EventMarket.sell(character, msg.material, msg.amount, msg.price);
        if (responce != 'ok') {
            alerts_1.Alerts.generic_user_alert(user, 'alert', responce);
        }
    }
    InventoryCommands.sell = sell;
    // export function clear_bulk_order(sw: SocketWrapper, data: number) {
    //     const [user, character] = Convert.socket_wrapper_to_user_character(sw)
    //     if (character == undefined) return
    //     let order = Data. this.world.entity_manager.orders[data]
    //     if (order.owner_id != character.id) {
    //         user.socket.emit('alert', 'not your order')
    //         return
    //     }
    //     this.world.entity_manager.remove_order(this.pool, data as market_order_index)
    // }
})(InventoryCommands = exports.InventoryCommands || (exports.InventoryCommands = {}));

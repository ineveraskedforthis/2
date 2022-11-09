"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCommands = void 0;
const materials_manager_1 = require("../../manager_classes/materials_manager");
const alerts_1 = require("./alerts");
const systems_communication_1 = require("../../systems_communication");
const inventory_events_1 = require("../../events/inventory_events");
const market_1 = require("../../events/market");
const data_1 = require("../../data");
const system_1 = require("../../market/system");
function r(f) {
    return (sw) => {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        f(user, character);
    };
}
var InventoryCommands;
(function (InventoryCommands) {
    function equip(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (character.in_battle()) {
            return;
        }
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
        if (character.in_battle()) {
            return;
        }
        console.log('unequip ' + msg);
        if (msg == "weapon") {
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
    function sell_item(sw, msg) {
        console.log('attempt to sell item ' + JSON.stringify(msg));
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        let index = parseInt(msg.index);
        let type = msg.item_type;
        let price = parseInt(msg.price);
        if ((type != 'armour') && (type != 'weapon'))
            return;
        if (isNaN(index) || isNaN(price))
            return;
        console.log('validated');
        const responce = market_1.EventMarket.sell_item(character, index, price);
        if (responce.responce != system_1.AuctionResponce.OK) {
            alerts_1.Alerts.generic_user_alert(user, 'alert', responce.responce);
        }
    }
    InventoryCommands.sell_item = sell_item;
    function execute_bulk_order(sw, amount, order_id) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        const order = systems_communication_1.Convert.id_to_bulk_order(order_id);
        if (order == undefined)
            return;
        const seller = systems_communication_1.Convert.id_to_character(order.owner_id);
        if (seller.cell_id != character.cell_id)
            return;
        if (isNaN(amount))
            return;
        let responce = 'ok';
        if (order.typ == 'buy') {
            market_1.EventMarket.execute_buy_order(character, order.id, amount);
        }
        if (order.typ == 'sell') {
            market_1.EventMarket.execute_sell_order(character, order.id, amount);
        }
        user.socket.emit('alert', responce);
    }
    InventoryCommands.execute_bulk_order = execute_bulk_order;
    function buyout(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        // validate that user input is safe
        let id = parseInt(msg);
        if (isNaN(id)) {
            return;
        }
        market_1.EventMarket.buyout_item(character, Number(msg));
    }
    InventoryCommands.buyout = buyout;
    function clear_bulk_order(sw, data) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (isNaN(data))
            return;
        let order = data_1.Data.BulkOrders.from_id(data);
        if (order == undefined)
            return;
        if (order.owner_id != character.id) {
            user.socket.emit('alert', 'not your order');
            return;
        }
        market_1.EventMarket.remove_bulk_order(order.id);
    }
    InventoryCommands.clear_bulk_order = clear_bulk_order;
    function clear_bulk_orders(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        market_1.EventMarket.remove_bulk_orders(character);
    }
    InventoryCommands.clear_bulk_orders = clear_bulk_orders;
    function clear_item_orders(sw) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        market_1.EventMarket.remove_item_orders(character);
    }
    InventoryCommands.clear_item_orders = clear_item_orders;
})(InventoryCommands = exports.InventoryCommands || (exports.InventoryCommands = {}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryCommands = void 0;
const alerts_1 = require("./alerts");
const systems_communication_1 = require("../../systems_communication");
const inventory_events_1 = require("../../events/inventory_events");
const market_1 = require("../../events/market");
const system_1 = require("../../market/system");
const data_objects_1 = require("../../data/data_objects");
const content_1 = require("../../../.././../game_content/src/content");
const effects_1 = require("../../events/effects");
const user_manager_1 = require("../user_manager");
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
    function eat(sw, msg) {
        // console.log(msg)
        // console.log(1)
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (character.in_battle()) {
            return;
        }
        // console.log(2)
        const id = String(msg);
        if (!content_1.MaterialConfiguration.is_valid_string_id(id))
            return;
        // console.log(3)
        const material = content_1.MaterialStorage.from_string(id);
        if (material.category != 8 /* MATERIAL_CATEGORY.FOOD */)
            return;
        // console.log(4)
        if (character.stash.get(material.id) == 0)
            alerts_1.Alerts.generic_user_alert(user, "alert", "You don't have this item");
        // console.log(5)
        character.stash.inc(material.id, -1);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 8 /* UI_Part.STASH */);
        effects_1.Effect.Change.hp(character, Math.round(material.density * 20 + material.magic_power * 5));
        effects_1.Effect.Change.stress(character, -Math.round(material.density * 5 + material.magic_power * 10));
        effects_1.Effect.Change.fatigue(character, -Math.round(material.density * 20 + material.magic_power * 5));
    }
    InventoryCommands.eat = eat;
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
        if (content_1.EquipSlotConfiguration.is_valid_string_id(msg))
            inventory_events_1.EventInventory.unequip(character, content_1.EquipSlotStorage.from_string(msg).id);
    }
    InventoryCommands.unequip = unequip;
    function buy(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        console.log('buy');
        console.log(msg);
        if (typeof msg != "object") {
            return;
        }
        if (msg == null) {
            return;
        }
        const key_price = "price";
        const key_amount = "amount";
        const key_material = "material";
        if (!(key_price in msg)) {
            return;
        }
        if (!(key_amount in msg)) {
            return;
        }
        if (!(key_material in msg)) {
            return;
        }
        let price = msg[key_price];
        let amount = msg[key_amount];
        let material = msg[key_material];
        if (!(typeof price == "number")) {
            return;
        }
        if (!(typeof amount == "number")) {
            return;
        }
        if (!(typeof material == "number")) {
            return;
        }
        if (isNaN(price)) {
            user.socket.emit('alert', 'invalid_price');
            return;
        }
        if (isNaN(amount)) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        if (isNaN(material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        price = Math.floor(price);
        amount = Math.floor(amount);
        material = Math.floor(material);
        if (!(typeof price == "number")) {
            return;
        }
        if (!(typeof amount == "number")) {
            return;
        }
        if (!(typeof material == "number")) {
            return;
        }
        if (price < 0) {
            user.socket.emit('alert', 'invalid_price');
        }
        if (amount <= 0) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        if (!content_1.MaterialConfiguration.is_valid_id(material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        let response = market_1.EventMarket.buy(character, material, amount, price);
        if (response != 'ok') {
            alerts_1.Alerts.generic_user_alert(user, 'alert', response);
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
        if (typeof msg != "object") {
            return;
        }
        if (msg == null) {
            return;
        }
        if (!("price" in msg)) {
            return;
        }
        if (!("amount" in msg)) {
            return;
        }
        if (!("material" in msg)) {
            return;
        }
        let price = msg["price"];
        let amount = msg["amount"];
        let material = msg["material"];
        if (!(typeof price == "number")) {
            return;
        }
        if (!(typeof amount == "number")) {
            return;
        }
        if (!(typeof material == "number")) {
            return;
        }
        if (isNaN(price)) {
            user.socket.emit('alert', 'invalid_price');
            return;
        }
        if (isNaN(amount)) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        if (isNaN(material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        price = Math.floor(price);
        amount = Math.floor(amount);
        material = Math.floor(material);
        if (!(typeof price == "number")) {
            return;
        }
        if (!(typeof amount == "number")) {
            return;
        }
        if (!(typeof material == "number")) {
            return;
        }
        if (price < 0) {
            user.socket.emit('alert', 'invalid_price');
        }
        if (amount <= 0) {
            user.socket.emit('alert', 'invalid_amount');
            return;
        }
        if (!content_1.MaterialConfiguration.is_valid_id(material)) {
            user.socket.emit('alert', 'invalid_material');
            return;
        }
        if (price > 99999999999) {
            user.socket.emit('alert', 'invalid_price');
            return;
        }
        console.log('sell is valid');
        let response = market_1.EventMarket.sell(character, material, amount, price);
        if (response != 'ok') {
            alerts_1.Alerts.generic_user_alert(user, 'alert', response);
        }
    }
    InventoryCommands.sell = sell;
    function sell_item(sw, msg) {
        console.log('attempt to sell item ' + JSON.stringify(msg));
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        let index = parseInt(msg.index);
        let price = parseInt(msg.price);
        if (isNaN(index) || isNaN(price))
            return;
        console.log('validated');
        const response = market_1.EventMarket.sell_item(character, index, price);
        if (response.response != system_1.AuctionResponse.OK) {
            console.log("impossible sale");
            console.log(response.response);
            alerts_1.Alerts.generic_user_alert(user, 'alert', response.response);
        }
    }
    InventoryCommands.sell_item = sell_item;
    function execute_bulk_order(sw, amount, order_id) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        const order = data_objects_1.Data.MarketOrders.from_number(order_id);
        if (order == undefined)
            return;
        const seller = data_objects_1.Data.Characters.from_id(order.owner_id);
        if (seller.cell_id != character.cell_id)
            return;
        if (isNaN(amount))
            return;
        let response = 'ok';
        if (order.typ == 'buy') {
            market_1.EventMarket.execute_buy_order(character, order.id, amount);
        }
        if (order.typ == 'sell') {
            market_1.EventMarket.execute_sell_order(character, order.id, amount);
        }
        user.socket.emit('alert', response);
    }
    InventoryCommands.execute_bulk_order = execute_bulk_order;
    function validate_item_buyout(msg) {
        if (msg == undefined)
            return false;
        if (typeof msg != 'object')
            return false;
        if (!('character_id' in msg))
            return false;
        if (!('item_id' in msg))
            return false;
        return true;
    }
    function buyout(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (!validate_item_buyout(msg))
            return;
        const character_id = msg.character_id;
        const item_id = msg.item_id;
        if (typeof character_id !== 'number')
            return;
        if (typeof item_id !== 'number')
            return;
        let seller = data_objects_1.Data.Characters.from_number(character_id);
        if (seller == undefined)
            return;
        market_1.EventMarket.buyout_item(seller, character, item_id);
    }
    InventoryCommands.buyout = buyout;
    function clear_bulk_order(sw, data) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        if (isNaN(data))
            return;
        let order = data_objects_1.Data.MarketOrders.from_id(data);
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
    function break_item(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        msg = Number(msg);
        if (isNaN(msg))
            return;
        inventory_events_1.EventInventory.destroy_in_backpack(character, msg);
    }
    InventoryCommands.break_item = break_item;
    function enchant(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        msg = Number(msg);
        if (isNaN(msg))
            return;
        inventory_events_1.EventInventory.enchant(character, msg);
    }
    InventoryCommands.enchant = enchant;
    function reroll_enchant(sw, msg) {
        const [user, character] = systems_communication_1.Convert.socket_wrapper_to_user_character(sw);
        if (character == undefined)
            return;
        msg = Number(msg);
        if (isNaN(msg))
            return;
        inventory_events_1.EventInventory.reroll_enchant(character, msg);
    }
    InventoryCommands.reroll_enchant = reroll_enchant;
})(InventoryCommands || (exports.InventoryCommands = InventoryCommands = {}));


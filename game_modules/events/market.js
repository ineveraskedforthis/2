"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventMarket = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
const system_1 = require("../market/system");
const systems_communication_1 = require("../systems_communication");
const effects_1 = require("./effects");
var EventMarket;
(function (EventMarket) {
    function buy(character, material, amount, price) {
        console.log('buy ' + material + ' ' + amount + ' ' + price);
        const responce = system_1.BulkOrders.new_buy_order(material, amount, price, character);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        return responce;
    }
    EventMarket.buy = buy;
    function sell(character, material, amount, price) {
        console.log('sell ' + material + ' ' + amount + ' ' + price);
        const responce = system_1.BulkOrders.new_sell_order(material, amount, price, character);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        return responce;
    }
    EventMarket.sell = sell;
    function sell_item(character, index, price) {
        console.log('sell item index ' + index);
        const responce = system_1.ItemOrders.sell(character, index, price);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        return responce;
    }
    EventMarket.sell_item = sell_item;
    function clear_orders(character) {
        remove_bulk_orders(character);
        remove_item_orders(character);
    }
    EventMarket.clear_orders = clear_orders;
    function remove_item_orders(character) {
        system_1.ItemOrders.remove_all_character(character);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    EventMarket.remove_item_orders = remove_item_orders;
    function remove_bulk_orders(character) {
        let temporary_list = Array.from(data_1.Data.CharacterBulkOrders(character.id));
        remove_orders_list(temporary_list);
    }
    EventMarket.remove_bulk_orders = remove_bulk_orders;
    function remove_orders_list(list) {
        for (let id of list) {
            remove_bulk_order(id);
        }
    }
    function remove_bulk_order(order_id) {
        const order = data_1.Data.BulkOrders.from_id(order_id);
        system_1.BulkOrders.remove(order_id);
        const character = data_1.Data.Character.from_id(order.owner_id);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
    }
    EventMarket.remove_bulk_order = remove_bulk_order;
})(EventMarket = exports.EventMarket || (exports.EventMarket = {}));

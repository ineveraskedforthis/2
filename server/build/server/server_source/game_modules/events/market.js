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
        const responce = system_1.BulkOrders.new_buy_order(material, amount, price, character);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        return responce;
    }
    EventMarket.buy = buy;
    function sell(character, material, amount, price) {
        // console.log('sell ' + material + ' ' + amount + ' ' + price)
        const responce = system_1.BulkOrders.new_sell_order(material, amount, price, character);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        return responce;
    }
    EventMarket.sell = sell;
    function sell_item(character, index, price) {
        // console.log('sell item index ' + index)
        const responce = system_1.ItemOrders.sell(character, index, price);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        effects_1.Effect.Update.cell_market(cell);
        return responce;
    }
    EventMarket.sell_item = sell_item;
    function execute_sell_order(buyer, order_id, amount) {
        system_1.BulkOrders.execute_sell_order(order_id, amount, buyer);
        const order = systems_communication_1.Convert.id_to_bulk_order(order_id);
        const seller = systems_communication_1.Convert.id_to_character(order.owner_id);
        user_manager_1.UserManagement.add_user_to_update_queue(buyer.user_id, 4 /* UI_Part.STASH */);
        user_manager_1.UserManagement.add_user_to_update_queue(buyer.user_id, 5 /* UI_Part.SAVINGS */);
        user_manager_1.UserManagement.add_user_to_update_queue(seller.user_id, 5 /* UI_Part.SAVINGS */);
        user_manager_1.UserManagement.add_user_to_update_queue(seller.user_id, 4 /* UI_Part.STASH */);
        const cell = systems_communication_1.Convert.character_to_cell(seller);
        effects_1.Effect.Update.cell_market(cell);
    }
    EventMarket.execute_sell_order = execute_sell_order;
    function execute_buy_order(seller, order_id, amount) {
        system_1.BulkOrders.execute_buy_order(order_id, amount, seller);
        const order = systems_communication_1.Convert.id_to_bulk_order(order_id);
        const buyer = systems_communication_1.Convert.id_to_character(order.owner_id);
        user_manager_1.UserManagement.add_user_to_update_queue(buyer.user_id, 4 /* UI_Part.STASH */);
        user_manager_1.UserManagement.add_user_to_update_queue(buyer.user_id, 5 /* UI_Part.SAVINGS */);
        user_manager_1.UserManagement.add_user_to_update_queue(seller.user_id, 5 /* UI_Part.SAVINGS */);
        user_manager_1.UserManagement.add_user_to_update_queue(seller.user_id, 4 /* UI_Part.STASH */);
        const cell = systems_communication_1.Convert.character_to_cell(seller);
        effects_1.Effect.Update.cell_market(cell);
    }
    EventMarket.execute_buy_order = execute_buy_order;
    function buyout_item(buyer, order_id) {
        const order = systems_communication_1.Convert.id_to_order_item(order_id);
        if (order == undefined)
            return;
        const seller = systems_communication_1.Convert.id_to_character(order.owner_id);
        system_1.ItemOrders.buy_unsafe(order_id, buyer);
        user_manager_1.UserManagement.add_user_to_update_queue(buyer.user_id, 3 /* UI_Part.BELONGINGS */);
        user_manager_1.UserManagement.add_user_to_update_queue(seller.user_id, 5 /* UI_Part.SAVINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(buyer);
        effects_1.Effect.Update.cell_market(cell);
    }
    EventMarket.buyout_item = buyout_item;
    /**
     * Clears all character orders.
     * @param character
     */
    function clear_orders(character) {
        // console.log('clear all orders of ' + character.name)
        remove_bulk_orders(character);
        remove_item_orders(character);
        character.trade_savings.transfer_all(character.savings);
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

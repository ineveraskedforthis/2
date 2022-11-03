"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventMarket = void 0;
const user_manager_1 = require("../client_communication/user_manager");
const system_1 = require("../market/system");
const systems_communication_1 = require("../systems_communication");
var EventMarket;
(function (EventMarket) {
    function buy(character, material, amount, price) {
        console.log('buy ' + material + ' ' + amount + ' ' + price);
        const responce = system_1.BulkOrders.new_buy_order(material, amount, price, character);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        const locals = cell.get_characters_list();
        for (let item of locals) {
            const id = item.id;
            const local_character = systems_communication_1.Convert.id_to_character(id);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 20 /* UI_Part.MARKET */);
        }
        return responce;
    }
    EventMarket.buy = buy;
    function sell(character, material, amount, price) {
        console.log('sell ' + material + ' ' + amount + ' ' + price);
        const responce = system_1.BulkOrders.new_sell_order(material, amount, price, character);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 3 /* UI_Part.BELONGINGS */);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        const locals = cell.get_characters_list();
        for (let item of locals) {
            const id = item.id;
            const local_character = systems_communication_1.Convert.id_to_character(id);
            user_manager_1.UserManagement.add_user_to_update_queue(local_character.user_id, 20 /* UI_Part.MARKET */);
        }
        return responce;
    }
    EventMarket.sell = sell;
    // export function clear_orders(character: Character) {
    //     BulkOrders.
    //      character.world.entity_manager.remove_orders(pool, character)
    //      AuctionManagement.cancel_all_orders(pool, character.world.entity_manager, character.world.socket_manager, character)
    // }
})(EventMarket = exports.EventMarket || (exports.EventMarket = {}));

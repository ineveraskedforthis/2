"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventMarket = void 0;
const user_manager_1 = require("../client_communication/user_manager");
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
    // export function clear_orders(character: Character) {
    //     BulkOrders.
    //      character.world.entity_manager.remove_orders(pool, character)
    //      AuctionManagement.cancel_all_orders(pool, character.world.entity_manager, character.world.socket_manager, character)
    // }
})(EventMarket = exports.EventMarket || (exports.EventMarket = {}));

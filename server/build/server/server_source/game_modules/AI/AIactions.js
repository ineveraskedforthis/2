"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIactions = void 0;
const manager_1 = require("../actions/manager");
const helpers_1 = require("./helpers");
const system_1 = require("../market/system");
const market_1 = require("../events/market");
const crafts_storage_1 = require("../craft/crafts_storage");
const inventory_events_1 = require("../events/inventory_events");
const system_2 = require("../items/system");
var AIactions;
(function (AIactions) {
    function craft_bulk(character, craft, budget) {
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, budget, craft.input);
        const sell_prices = helpers_1.AIhelper.sell_prices_craft_bulk(character, craft);
        for (let item of sell_prices) {
            const current = character.stash.get(item.material);
            if (current == 0)
                continue;
            system_1.BulkOrders.remove_by_condition(character, item.material);
            let total_amount = character.stash.get(item.material);
            market_1.EventMarket.sell(character, item.material, total_amount, item.price);
        }
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_1.BulkOrders.remove_by_condition(character, item.material);
            market_1.EventMarket.buy(character, item.material, item.amount, item.price);
        }
        manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[craft.id], character, character.cell_id);
    }
    AIactions.craft_bulk = craft_bulk;
    function buy_inputs_to_craft_item(character, item, budget) {
        // BulkOrders.remove_by_condition(character, )
        let inputs = item.input;
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, budget, inputs);
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_1.BulkOrders.remove_by_condition(character, item.material);
            market_1.EventMarket.buy(character, item.material, item.amount, item.price);
        }
    }
    AIactions.buy_inputs_to_craft_item = buy_inputs_to_craft_item;
    function craft_item(character, item) {
        // console.log(character.get_name(), ' crafts ', item.id)
        manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[item.id], character, character.cell_id);
    }
    AIactions.craft_item = craft_item;
    function sell_items(character) {
        for (let [index, item] of Object.entries(character.equip.data.backpack.items)) {
            if (item == undefined)
                continue;
            let slot = system_2.ItemSystem.slot(item);
            if (character.equip.data.slots[slot] == undefined) {
                inventory_events_1.EventInventory.equip_from_backpack(character, Number(index));
            }
            else {
                let price = helpers_1.AIhelper.sell_price_item(character, item, item.durability);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    AIactions.sell_items = sell_items;
})(AIactions = exports.AIactions || (exports.AIactions = {}));

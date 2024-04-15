"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIactions = void 0;
const manager_1 = require("../actions/manager");
const helpers_1 = require("./helpers");
const system_1 = require("../market/system");
const market_1 = require("../events/market");
const crafts_storage_1 = require("../craft/crafts_storage");
const inventory_events_1 = require("../events/inventory_events");
const data_objects_1 = require("../data/data_objects");
const item_1 = require("../../content_wrappers/item");
var AIactions;
(function (AIactions) {
    function craft_bulk(character, craft, budget) {
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, budget, craft.input);
        const sell_prices = helpers_1.AIhelper.sell_prices_craft_bulk(character, craft);
        for (let item of sell_prices) {
            const current = character.stash.get(item.material);
            if (current == 0)
                continue;
            system_1.MarketOrders.remove_by_condition(character, item.material);
            let total_amount = character.stash.get(item.material);
            market_1.EventMarket.sell(character, item.material, total_amount, item.price);
        }
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_1.MarketOrders.remove_by_condition(character, item.material);
            market_1.EventMarket.buy(character, item.material, item.amount, item.price);
        }
        manager_1.ActionManager.start_action(crafts_storage_1.craft_actions[craft.id], character, character.cell_id);
    }
    AIactions.craft_bulk = craft_bulk;
    function buy_inputs_to_craft_item(character, item, budget) {
        // MarketOrders.remove_by_condition(character, )
        let inputs = item.input;
        const buy = helpers_1.AIhelper.buy_craft_inputs(character, budget, inputs);
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            system_1.MarketOrders.remove_by_condition(character, item.material);
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
            //console.log(item)
            const object = data_objects_1.Data.Items.from_id(item);
            let slot = 0 /* EQUIP_SLOT.WEAPON */;
            if (!(0, item_1.is_weapon)(object)) {
                slot = object.prototype.slot;
            }
            if (character.equip.data.slots[slot] == undefined) {
                inventory_events_1.EventInventory.equip_from_backpack(character, Number(index));
            }
            else {
                let price = helpers_1.AIhelper.sell_price_item(character, object);
                market_1.EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
    AIactions.sell_items = sell_items;
})(AIactions || (exports.AIactions = AIactions = {}));

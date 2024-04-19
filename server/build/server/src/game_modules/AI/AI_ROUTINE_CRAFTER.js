"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crafter_routine = exports.decide_bulk_craft = void 0;
const crafts_storage_1 = require("../craft/crafts_storage");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const AIactions_1 = require("./AIactions");
const ACTIONS_BASIC_1 = require("./ACTIONS_BASIC");
const CraftItem_1 = require("../craft/CraftItem");
const helpers_1 = require("../craft/helpers");
const system_1 = require("../market/system");
const data_objects_1 = require("../data/data_objects");
const item_1 = require("../../content_wrappers/item");
const inventory_events_1 = require("../events/inventory_events");
function decide_bulk_craft(character) {
    let result = [];
    (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
    for (const craft of Object.values(crafts_storage_1.crafts_bulk)) {
        let profit = AI_SCRIPTED_VALUES_1.AItrade.craft_bulk_profitability(character, craft);
        // console.log(`character ${character.get_name()} has profitability of ${profit} for craft ${craft.id}`)
        result.push({ craft: craft, profit: profit });
    }
    return result;
}
exports.decide_bulk_craft = decide_bulk_craft;
function bulk_crafter_routine(character, budget) {
    const bulk_crafts = decide_bulk_craft(character);
    let sum_of_squared_profits = 0;
    for (let item of bulk_crafts) {
        if (item.profit > 0) {
            sum_of_squared_profits += item.profit * item.profit;
        }
        else {
            for (let input of item.craft.input) {
                system_1.MarketOrders.remove_by_condition(character, input.material);
            }
        }
    }
    for (let item of bulk_crafts) {
        if (item.profit <= 0)
            continue;
        let budget_ratio = item.profit * item.profit / sum_of_squared_profits;
        AIactions_1.AIactions.craft_bulk(character, item.craft, Math.round(budget * budget_ratio));
    }
}
function decide_item_buy_inputs(character) {
    let result = [];
    for (const item of Object.values(crafts_storage_1.crafts_items)) {
        if (item.output.tag == "armour") {
            if (system_1.ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3)
                continue;
        }
        if (item.output.tag == "weapon") {
            if (system_1.ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3)
                continue;
        }
        if (((0, CraftItem_1.durability)(character, item) > 100)) {
            result.push(item);
        }
    }
    let index = Math.floor(Math.random() * result.length);
    return result[index];
}
function decide_item_craft(character) {
    let result = [];
    for (const item of Object.values(crafts_storage_1.crafts_items)) {
        if (item.output.tag == "armour") {
            if (system_1.ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3)
                continue;
        }
        if (item.output.tag == "weapon") {
            if (system_1.ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3)
                continue;
        }
        if (((0, CraftItem_1.durability)(character, item) > 100) && ((0, helpers_1.check_inputs)(item.input, character.stash))) {
            result.push(item);
        }
    }
    let index = Math.floor(Math.random() * result.length);
    return result[index];
}
function item_crafter_routine(character, budget) {
    (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
    if (Math.random() < 0.1) {
        system_1.MarketOrders.remove_by_character(character);
    }
    //get rid of common items
    const to_get_rid_of = [];
    for (const item of character.equip.data.backpack.items) {
        const data = data_objects_1.Data.Items.from_id(item);
        if ((0, item_1.is_armour)(data)) {
            if (system_1.ItemOrders.count_armour_orders_of_type(character.cell_id, data.prototype.id) >= 4)
                if ((Math.random() < 0.1) && (data.affixes.length == 0))
                    to_get_rid_of.push(item);
        }
        if ((0, item_1.is_weapon)(data)) {
            if (system_1.ItemOrders.count_weapon_orders_of_type(character.cell_id, data.prototype.id) >= 4)
                if ((Math.random() < 0.1) && (data.affixes.length == 0))
                    to_get_rid_of.push(item);
        }
    }
    for (const item of to_get_rid_of) {
        inventory_events_1.EventInventory.destroy_in_backpack_by_item_id(character, item);
    }
    let item = decide_item_buy_inputs(character);
    if (item == undefined)
        return;
    AIactions_1.AIactions.buy_inputs_to_craft_item(character, item, budget);
    let item_craft = decide_item_craft(character);
    if (item_craft == undefined)
        return;
    AIactions_1.AIactions.craft_item(character, item_craft);
}
function crafter_routine(character) {
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    if (character.is_player())
        return;
    const total_crafting_budget = Math.min(400, character.savings.get() / 4);
    if (Math.random() < 0.5) {
        bulk_crafter_routine(character, total_crafting_budget);
    }
    else {
        item_crafter_routine(character, total_crafting_budget);
    }
    AIactions_1.AIactions.sell_items(character);
}
exports.crafter_routine = crafter_routine;

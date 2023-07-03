"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crafter_routine = exports.decide_bulk_craft = void 0;
const crafts_storage_1 = require("../craft/crafts_storage");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const AIactions_1 = require("./AIactions");
const ACTIONS_BASIC_1 = require("./ACTIONS_BASIC");
const CraftItem_1 = require("../craft/CraftItem");
const helpers_1 = require("../craft/helpers");
// import { rest_outside } from "./actions";
// import { base_price } from "./helpers";
// import { tired } from "./triggers";
function decide_bulk_craft(character) {
    let result = [];
    (0, ACTIONS_BASIC_1.update_price_beliefs)(character);
    for (const craft of Object.values(crafts_storage_1.crafts_bulk)) {
        let profit = AI_SCRIPTED_VALUES_1.AItrade.craft_bulk_profitability(character, craft);
        // console.log(`character ${character.get_name()} has profitability of ${profit} for craft ${craft.id}`)
        if (profit > 0) {
            result.push({ craft: craft, profit: profit });
        }
    }
    return result;
}
exports.decide_bulk_craft = decide_bulk_craft;
function bulk_crafter_routine(character, budget) {
    const bulk_crafts = decide_bulk_craft(character);
    let sum_of_squared_profits = 0;
    for (let item of bulk_crafts) {
        sum_of_squared_profits += item.profit * item.profit;
    }
    for (let item of bulk_crafts) {
        let budget_ratio = item.profit * item.profit / sum_of_squared_profits;
        AIactions_1.AIactions.craft_bulk(character, item.craft, Math.round(budget * budget_ratio));
    }
}
function decide_item_buy_inputs(character) {
    let result = [];
    for (const item of Object.values(crafts_storage_1.crafts_items)) {
        // let cost =  item.output, durability(character, item))
        // let price = AIhelper.sell_price_item(item.output, durability(character, item))
        if ((0, CraftItem_1.durability)(character, item) > 120) {
            result.push(item);
        }
    }
    let index = Math.floor(Math.random() * result.length);
    return result[index];
}
function decide_item_craft(character) {
    let result = [];
    for (const item of Object.values(crafts_storage_1.crafts_items)) {
        if (((0, CraftItem_1.durability)(character, item) > 120) && ((0, helpers_1.check_inputs)(item.input, character.stash))) {
            result.push(item);
        }
    }
    let index = Math.floor(Math.random() * result.length);
    return result[index];
}
function item_crafter_routine(character, budget) {
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
    if (character.current_building != undefined)
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

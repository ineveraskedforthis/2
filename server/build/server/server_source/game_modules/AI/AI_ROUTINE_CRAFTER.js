"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crafter_routine = exports.decide_bulk_craft = void 0;
const system_1 = require("../character/system");
const crafts_storage_1 = require("../craft/crafts_storage");
const materials_manager_1 = require("../manager_classes/materials_manager");
const AI_ROUTINE_GENERIC_1 = require("./AI_ROUTINE_GENERIC");
const AI_SCRIPTED_VALUES_1 = require("./AI_SCRIPTED_VALUES");
const AIactions_1 = require("./AIactions");
const actions_1 = require("./actions");
// import { rest_outside } from "./actions";
// import { base_price } from "./helpers";
// import { tired } from "./triggers";
function decide_bulk_craft(character) {
    let result = [];
    (0, actions_1.update_price_beliefs)(character);
    for (const craft of Object.values(crafts_storage_1.crafts_bulk)) {
        let profit = AI_SCRIPTED_VALUES_1.AItrade.craft_bulk_profitability(character, craft);
        // console.log(`character ${character.name} has profitability of ${profit} for craft ${craft.id}`)
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
function crafter_routine(character) {
    if (character.in_battle())
        return;
    if (character.action != undefined)
        return;
    if (character.is_player())
        return;
    if (character.current_building != undefined)
        return;
    (0, AI_ROUTINE_GENERIC_1.GenericRest)(character);
    // bulk crafting
    const total_crafting_budget = Math.min(400, character.savings.get() / 4);
    bulk_crafter_routine(character, total_crafting_budget);
    if ((system_1.CharacterSystem.skill(character, 'woodwork') > 40) && (character.perks.weapon_maker == true)) {
        AIactions_1.AIactions.make_wooden_weapon(character, AI_SCRIPTED_VALUES_1.AItrade.buy_price_bulk(character, materials_manager_1.WOOD));
    }
    if ((system_1.CharacterSystem.skill(character, 'bone_carving') > 40) && (character.perks.weapon_maker == true)) {
        AIactions_1.AIactions.make_bone_weapon(character, AI_SCRIPTED_VALUES_1.AItrade.buy_price_bulk(character, materials_manager_1.RAT_BONE));
    }
    if ((system_1.CharacterSystem.skill(character, 'clothier') > 40) && (character.perks.skin_armour_master == true)) {
        AIactions_1.AIactions.make_armour(character, AI_SCRIPTED_VALUES_1.AItrade.buy_price_bulk(character, materials_manager_1.RAT_SKIN));
    }
    if ((system_1.CharacterSystem.skill(character, 'clothier') > 40) && (character.perks.shoemaker == true)) {
        AIactions_1.AIactions.make_boots(character, AI_SCRIPTED_VALUES_1.AItrade.buy_price_bulk(character, materials_manager_1.RAT_SKIN));
    }
}
exports.crafter_routine = crafter_routine;

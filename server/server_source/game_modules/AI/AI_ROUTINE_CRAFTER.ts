import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { CharacterSystem } from "../character/system";
import { crafts_bulk } from "../craft/crafts_storage";
import { RAT_BONE, RAT_SKIN, WOOD } from "../manager_classes/materials_manager";
import { GenericRest } from "./AI_ROUTINE_GENERIC";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { AIactions } from "./AIactions";
import { update_price_beliefs } from "./actions";
// import { rest_outside } from "./actions";
// import { base_price } from "./helpers";
// import { tired } from "./triggers";

export function decide_bulk_craft(character: Character) {
    let result = []
    update_price_beliefs(character)
    for (const craft of Object.values(crafts_bulk)) {
        let profit = AItrade.craft_bulk_profitability(character, craft)
        // console.log(`character ${character.name} has profitability of ${profit} for craft ${craft.id}`)
        if (profit > 0) {
            result.push({craft: craft, profit: profit})
        }
    }
    return result
}

function bulk_crafter_routine(character: Character, budget: money) {
    const bulk_crafts = decide_bulk_craft(character)
    let sum_of_squared_profits = 0
    for (let item of bulk_crafts) {
        sum_of_squared_profits += item.profit * item.profit
    }
    for (let item of bulk_crafts) {
        let budget_ratio = item.profit * item.profit / sum_of_squared_profits
        AIactions.craft_bulk(character, item.craft, Math.round(budget * budget_ratio) as money)
    }
}

export function crafter_routine(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return
    if (character.current_building != undefined) return

    GenericRest(character);

    // bulk crafting
    const total_crafting_budget = Math.min(400, character.savings.get() / 4) as money
    bulk_crafter_routine(character, total_crafting_budget)

    if ((CharacterSystem.skill(character, 'woodwork') > 40) && (character.perks.weapon_maker == true)) {
        AIactions.make_wooden_weapon(character, AItrade.buy_price_bulk(character, WOOD));
    }

    if ((CharacterSystem.skill(character, 'bone_carving') > 40) && (character.perks.weapon_maker == true)) {
        AIactions.make_bone_weapon(character, AItrade.buy_price_bulk(character, RAT_BONE));
    }

    if ((CharacterSystem.skill(character, 'clothier') > 40) && (character.perks.skin_armour_master == true)) {
        AIactions.make_armour(character, AItrade.buy_price_bulk(character, RAT_SKIN));
    }

    if ((CharacterSystem.skill(character, 'clothier') > 40) && (character.perks.shoemaker == true)) {
        AIactions.make_boots(character, AItrade.buy_price_bulk(character, RAT_SKIN));
    }
}
import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { crafts_bulk, crafts_items } from "../craft/crafts_storage";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { AIactions } from "./AIactions";
import { update_price_beliefs } from "./ACTIONS_BASIC";
import { durability } from "../craft/CraftItem";
import { check_inputs } from "../craft/helpers";
import { MarketOrders } from "../market/system";

export function decide_bulk_craft(character: Character) {
    let result = []
    update_price_beliefs(character)
    for (const craft of Object.values(crafts_bulk)) {
        let profit = AItrade.craft_bulk_profitability(character, craft)
        // console.log(`character ${character.get_name()} has profitability of ${profit} for craft ${craft.id}`)
        result.push({craft: craft, profit: profit})
    }
    return result
}

function bulk_crafter_routine(character: Character, budget: money) {
    const bulk_crafts = decide_bulk_craft(character)
    let sum_of_squared_profits = 0
    for (let item of bulk_crafts) {
        if (item.profit > 0){
            sum_of_squared_profits += item.profit * item.profit
        } else {
            for (let input of item.craft.input) {
                MarketOrders.remove_by_condition(character, input.material);
            }
        }
    }
    for (let item of bulk_crafts) {
        if (item.profit <= 0) continue;
        let budget_ratio = item.profit * item.profit / sum_of_squared_profits
        AIactions.craft_bulk(character, item.craft, Math.round(budget * budget_ratio) as money)
    }
}

function decide_item_buy_inputs(character: Character) {
    let result = []
    for (const item of Object.values(crafts_items)) {
        if (durability(character, item) > 100) {
            result.push(item)
        }
    }

    let index = Math.floor(Math.random() * result.length);
    return result[index]
}

function decide_item_craft(character: Character) {
    let result = []
    for (const item of Object.values(crafts_items)) {
        if ((durability(character, item) > 120)&&(check_inputs(item.input, character.stash))){
            result.push(item)
        }
    }

    let index = Math.floor(Math.random() * result.length);
    return result[index]
}

function item_crafter_routine(character: Character, budget: money) {
    update_price_beliefs(character)

    if (Math.random() < 0.1) {
        MarketOrders.remove_by_character(character)
    }

    let item = decide_item_buy_inputs(character)
    if (item == undefined) return
    AIactions.buy_inputs_to_craft_item(character, item, budget)

    let item_craft = decide_item_craft(character)
    if (item_craft == undefined) return
    AIactions.craft_item(character, item_craft)
}

export function crafter_routine(character: Character) {
    if (character.in_battle()) return
    if (character.action != undefined) return
    if (character.is_player()) return

    const total_crafting_budget = Math.min(400, character.savings.get() / 4) as money
    if (Math.random() < 0.5) {
        bulk_crafter_routine(character, total_crafting_budget)
    } else {
        item_crafter_routine(character, total_crafting_budget)
    }
    AIactions.sell_items(character)
}
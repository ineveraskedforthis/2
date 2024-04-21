import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { crafts_bulk, crafts_items } from "../craft/crafts_storage";
import { AItrade } from "./AI_SCRIPTED_VALUES";
import { AIactions } from "./AIactions";
import { update_price_beliefs } from "./ACTIONS_BASIC";
import { durability } from "../craft/CraftItem";
import { check_inputs } from "../craft/helpers";
import { ItemOrders, MarketOrders } from "../market/system";
import { Data } from "../data/data_objects";
import { is_armour, is_weapon } from "../../content_wrappers/item";
import { EventInventory } from "../events/inventory_events";
import { CharacterSystem } from "../character/system";

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
        if (item.output.tag == "armour") {
            if (ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3) continue
        }
        if (item.output.tag == "weapon") {
            if (ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3) continue
        }

        if ((durability(character, item) > 100)) {
            result.push(item)
        }
    }

    let index = Math.floor(Math.random() * result.length);
    return result[index]
}

function decide_item_craft(character: Character) {
    let result = []
    for (const item of Object.values(crafts_items)) {
        if (item.output.tag == "armour") {
            if (ItemOrders.count_armour_orders_of_type(character.cell_id, item.output.value) >= 3) continue
        }
        if (item.output.tag == "weapon") {
            if (ItemOrders.count_weapon_orders_of_type(character.cell_id, item.output.value) >= 3) continue
        }

        if ((durability(character, item) > 100) && (check_inputs(item.input, character.stash))){
            result.push(item)
        }
    }

    let index = Math.floor(Math.random() * result.length);
    return result[index]
}

function item_crafter_routine(character: Character, budget: money) {
    if (character.equip.data.backpack.items.length > 8) {
        CharacterSystem.open_shop(character)
    }

    update_price_beliefs(character)

    if (Math.random() < 0.1) {
        MarketOrders.remove_by_character(character)
    }

    //get rid of common items
    const to_get_rid_of = []
    for (const item of character.equip.data.backpack.items) {
        const data = Data.Items.from_id(item)

        if (is_armour(data)) {
            if (ItemOrders.count_armour_orders_of_type(character.cell_id, data.prototype.id) >= 4)
                if ((Math.random() < 0.1) && (data.affixes.length == 0))
                    to_get_rid_of.push(item)
        }
        if (is_weapon(data)) {
            if (ItemOrders.count_weapon_orders_of_type(character.cell_id, data.prototype.id) >= 4)
                if ((Math.random() < 0.1) && (data.affixes.length == 0))
                    to_get_rid_of.push(item)
        }
    }

    for (const item of to_get_rid_of) {
        EventInventory.destroy_in_backpack_by_item_id(character, item)
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
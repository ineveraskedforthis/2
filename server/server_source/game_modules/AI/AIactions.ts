import type { Character } from "../character/character";
import { ActionManager } from "../actions/manager";
import { AIhelper } from "./helpers";
import { BulkOrders } from "../market/system";
import { EventMarket } from "../events/market";
import { CraftBulkTemplate, CraftItemTemplate, craft_actions } from "../craft/crafts_storage";
import { money } from "@custom_types/common";
import { EventInventory } from "../events/inventory_events";
import { ItemSystem } from "../items/system";


export namespace AIactions {
    export function craft_bulk(character: Character, craft: CraftBulkTemplate, budget: money) {
        const buy = AIhelper.buy_craft_inputs(character, budget, craft.input);
        const sell_prices = AIhelper.sell_prices_craft_bulk(character, craft);

        for (let item of sell_prices) {
            const current = character.stash.get(item.material);
            if (current == 0)
                continue;

            BulkOrders.remove_by_condition(character, item.material);
            let total_amount = character.stash.get(item.material);
            EventMarket.sell(character, item.material, total_amount, item.price);
        }

        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            BulkOrders.remove_by_condition(character, item.material);
            EventMarket.buy(character, item.material, item.amount, item.price);
        }

        ActionManager.start_action(craft_actions[craft.id], character, character.cell_id);
    }

    export function buy_inputs_to_craft_item(character: Character, item: CraftItemTemplate, budget: money) {
        // BulkOrders.remove_by_condition(character, )
        let inputs = item.input
        const buy = AIhelper.buy_craft_inputs(character, budget, inputs);
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            BulkOrders.remove_by_condition(character, item.material);
            EventMarket.buy(character, item.material, item.amount, item.price);
        }
    }

    export function craft_item(character: Character, item: CraftItemTemplate) {
        // console.log(character.get_name(), ' crafts ', item.id)
        ActionManager.start_action(craft_actions[item.id], character, character.cell_id)
    }

    export function sell_items(character: Character) {
        for (let [index, item] of Object.entries(character.equip.data.backpack.items)) {
            if (item == undefined) continue
            let slot = ItemSystem.slot(item)
            if (slot == 'weapon') {
                if (character.equip.data.weapon == undefined) {
                    EventInventory.equip_from_backpack(character, Number(index))
                } else {
                    let price = AIhelper.sell_price_item(character, item, item.durability);
                    EventMarket.sell_item(character, Number(index), price);
                }
            } else {
                if (character.equip.data.armour[slot] == undefined) {
                    EventInventory.equip_from_backpack(character, Number(index))
                } else {
                    let price = AIhelper.sell_price_item(character, item, item.durability);
                    EventMarket.sell_item(character, Number(index), price);
                }
            }
        }
    }
}

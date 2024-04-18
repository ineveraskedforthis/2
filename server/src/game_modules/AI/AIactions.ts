import type { Character } from "../character/character";
import { ActionManager } from "../actions/manager";
import { AIhelper } from "./helpers";
import { MarketOrders } from "../market/system";
import { EventMarket } from "../events/market";
import { craft_actions } from "../craft/crafts_storage";
import { CraftBulkTemplate, CraftItemTemplate } from "@custom_types/inventory";
import { money } from "@custom_types/common";
import { EventInventory } from "../events/inventory_events";
import { ItemSystem } from "../systems/items/item_system";
import { Data } from "../data/data_objects";
import { is_weapon } from "../../content_wrappers/item";
import { EQUIP_SLOT } from "@content/content";
import { buy_from_market_limits } from "./ACTIONS_BASIC";


export namespace AIactions {
    export function craft_bulk(character: Character, craft: CraftBulkTemplate, budget: money) {
        const buy = AIhelper.buy_craft_inputs(character, budget, craft.input);
        const sell_prices = AIhelper.sell_prices_craft_bulk(character, craft);

        for (let item of sell_prices) {
            const current = character.stash.get(item.material);
            if (current == 0)
                continue;

            MarketOrders.remove_by_condition(character, item.material);
            let total_amount = character.stash.get(item.material);
            EventMarket.sell(character, item.material, total_amount, item.price);
        }

        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            MarketOrders.remove_by_condition(character, item.material);

            item.amount -= buy_from_market_limits(character, item.material, item.price, item.amount)
            if (item.amount <= 0)
                continue;

            EventMarket.buy(character, item.material, item.amount, item.price);
        }

        ActionManager.start_action(craft_actions[craft.id], character, character.cell_id);
    }

    export function buy_inputs_to_craft_item(character: Character, item: CraftItemTemplate, budget: money) {
        // MarketOrders.remove_by_condition(character, )
        let inputs = item.input
        const buy = AIhelper.buy_craft_inputs(character, budget, inputs);
        for (let item of buy) {
            if (character.stash.get(item.material) > 50)
                continue;
            if (item.amount == 0)
                continue;
            MarketOrders.remove_by_condition(character, item.material);

            item.amount -= buy_from_market_limits(character, item.material, item.price, item.amount)
            if (item.amount <= 0)
                continue;

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
            //console.log(item)
            const object = Data.Items.from_id(item)
            let slot = EQUIP_SLOT.WEAPON
            if (!is_weapon(object)) {
                slot = object.prototype.slot
            }
            if (character.equip.data.slots[slot] == undefined) {
                EventInventory.equip_from_backpack(character, Number(index))
            } else {
                let price = AIhelper.sell_price_item(character, object);
                EventMarket.sell_item(character, Number(index), price);
            }
        }
    }
}

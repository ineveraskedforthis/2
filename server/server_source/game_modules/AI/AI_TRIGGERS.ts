import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { ScriptedValue } from "../events/scripted_values";
import { MapSystem } from "../map/system";
import { material_index } from "@custom_types/inventory";
import { Convert } from "../systems_communication";

export namespace AI_TRIGGER {
    export function tired(character: Character) {
        return (character.get_fatigue() > 50)
            || (character.get_stress()  > 50);
    }

    export function low_hp(character: Character) {
        return character.get_hp() < 0.5 * character.get_max_hp();
    }

    export function at_home(character: Character) {
        const home = character.home_cell_id
        if (home != undefined) {
            if (home == character.cell_id) {
                return true
            } else {
                return false
            }
        }
        if (MapSystem.has_market(character.cell_id)) {
            return true
        }
        return false
    }

    export function can_buy(character: Character, material_index: material_index, budget: money) {
        let orders = Convert.cell_id_to_bulk_orders(character.cell_id);
        let best_order = undefined;
        let best_price = 9999;
        for (let item of orders) {
            let order = Convert.id_to_bulk_order(item);
            if (order.typ == 'buy')
                continue;
            if (order.tag != material_index)
                continue;
            if ((best_price > order.price) && (order.amount > 0)) {
                best_price = order.price;
                best_order = order;
            }
        }
        if (best_order == undefined)
            return false;
        if (budget >= best_price) {
            return true;
        }
        return false;
    }
}

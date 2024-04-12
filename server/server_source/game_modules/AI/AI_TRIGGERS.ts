import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { MapSystem } from "../map/system";
import { material_index } from "@custom_types/inventory";
import { DataID } from "../data/data_id";
import { Data } from "../data/data_objects";

export namespace AI_TRIGGER {
    export function tired(character: Character) {
        return (character.get_fatigue() > 50)
            || (character.get_stress()  > 50);
    }

    export function low_hp(character: Character) {
        return character.get_hp() < 0.5 * character.get_max_hp();
    }

    export function at_home(character: Character) {
        const home = character.home_location_id
        if (home != undefined) {
            if (home == character.location_id) {
                return true
            } else {
                return false
            }
        }
        return true
    }

    export function can_buy(character: Character, material_index: material_index, budget: money) {
        let orders = DataID.Cells.market_order_id_list(character.cell_id);
        let best_order = undefined;
        let best_price = 9999;
        for (let item of orders) {
            let order = Data.MarketOrders.from_id(item);
            if (order.typ == 'buy')
                continue;
            if (order.material != material_index)
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

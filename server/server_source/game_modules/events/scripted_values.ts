import { Data } from "../data";
import { building_id, money } from "../types";

export namespace ScriptedValue {
    export function room_price(building_id: building_id) {
        let building = Data.Buildings.from_id(building_id)
        let owner_id = Data.Buildings.owner(building_id)

        if (owner_id == undefined) return 0 as money;

        return building.room_cost as money
    }
}
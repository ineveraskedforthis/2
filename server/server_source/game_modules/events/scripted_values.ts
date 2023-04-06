import { Data } from "../data";
import { building_id, char_id, money } from "../types";

export namespace ScriptedValue {
    export function room_price(building_id: building_id, character: char_id) {
        let building = Data.Buildings.from_id(building_id)
        let owner_id = Data.Buildings.owner(building_id)

        if (owner_id == undefined) return 0 as money;
        if (owner_id == character) return 0 as money;
        
        return building.room_cost as money
    }

    export function building_price_wood(tier: number) {
        return tier * tier * 50
    }
}
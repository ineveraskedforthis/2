import { Data } from "../data";
import { building_id, char_id, money, tagRACE } from "../types";

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

    export function rest_target_fatigue(tier: number, quality: number, race: tagRACE) {
        let multiplier = 1
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.9
        return Math.floor((5 - tier) * 6 * (200 - quality) / 100 * multiplier)
    }

    export function rest_target_stress(tier: number, quality: number, race: tagRACE) {
        let multiplier = 1
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.9
        return Math.floor((5 - tier) * 8 * (200 - quality) / 100 * multiplier)
    }
}
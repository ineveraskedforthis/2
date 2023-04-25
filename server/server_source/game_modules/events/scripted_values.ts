import { BuildingType } from "../DATA_LAYOUT_BUILDING";
import { Character } from "../character/character";
import { Data } from "../data";
import { building_id, char_id, money, tagRACE } from "../types";

export namespace ScriptedValue {
    export function building_rest_tier(type: BuildingType, character: Character): number {
        switch(type){
            case BuildingType.Shack:return 2
            case BuildingType.Inn:return 3
            case BuildingType.HumanHouse:return 4
            case BuildingType.RatLair: {
                if (character.race() == 'rat') return 5
                return 2
            }
            case BuildingType.ElodinoHouse: {
                if (character.race() == 'elo') return 5
                return 2
            }
        }
    }


    export function room_price(building_id: building_id, character: char_id) {
        let building = Data.Buildings.from_id(building_id)
        let owner_id = Data.Buildings.owner(building_id)

        if (owner_id == undefined) return 0 as money;
        if (owner_id == character) return 0 as money;
        
        return building.room_cost as money
    }

    export function building_price_wood(type: BuildingType) {
        switch(type){
            case BuildingType.Shack:return 50
            case BuildingType.Inn:return 400
            case BuildingType.HumanHouse:return 200
            case BuildingType.RatLair:return 0
            case BuildingType.ElodinoHouse:return 600
        }
    }

    export function building_rooms(type: BuildingType) {
        switch(type){
            case BuildingType.Shack:return 1
            case BuildingType.Inn:return 5
            case BuildingType.HumanHouse:return 2
            case BuildingType.RatLair:return 10
            case BuildingType.ElodinoHouse:return 10
        }
    }

    export function rest_target_fatigue(tier: number, quality: number, race: tagRACE) {
        let multiplier = 1
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.1
        return Math.floor((5 - tier) * 5 * (200 - quality) / 100 * multiplier)
    }

    export function rest_target_stress(tier: number, quality: number, race: tagRACE) {
        let multiplier = 1
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.1
        return Math.floor((5 - tier) * 15 * (200 - quality) / 100 * multiplier)
    }
}
import { LandPlotType } from "@custom_types/buildings";
import { Character } from "../character/character";
import { Data } from "../data";
import { building_id, char_id, tagRACE } from "../types";
import { money } from "@custom_types/common";
import { trim } from "../calculations/basic_functions";

export namespace ScriptedValue {
    export function building_rest_tier(type: LandPlotType, character: Character): number {
        switch(type){
            case LandPlotType.Shack:return 4
            case LandPlotType.Inn:return 8
            case LandPlotType.HumanHouse:return 10
            case LandPlotType.RatLair: {
                if (character.race == 'rat') return 10
                return 1
            }
            case LandPlotType.ElodinoHouse: {
                if (character.race == 'elo') return 10
                return 1
            }
        }

        return 0
    }


    export function room_price(building_id: building_id, character: char_id) {
        let building = Data.Buildings.from_id(building_id)
        let owner_id = Data.Buildings.owner(building_id)

        if (owner_id == undefined) return 0 as money;
        if (owner_id == character) return 0 as money;
        
        return building.room_cost as money
    }

    export function building_price_wood(type: LandPlotType): number {
        switch(type){
            case LandPlotType.Shack:return 30
            case LandPlotType.Inn:return 200
            case LandPlotType.HumanHouse:return 100
            case LandPlotType.RatLair:return 0
            case LandPlotType.ElodinoHouse:return 600
            case LandPlotType.CottonField: return 800
            case LandPlotType.FarmPlot: return 800
            case LandPlotType.ForestPlot: return 800
            case LandPlotType.LandPlot: return 800
        }
    }

    // export function building_rooms(type: BuildingType) {
    //     switch(type){
    //         case BuildingType.Shack:return 1
    //         case BuildingType.Inn:return 5
    //         case BuildingType.HumanHouse:return 2
    //         case BuildingType.RatLair:return 10
    //         case BuildingType.ElodinoHouse:return 10
    //     }
    // }

    /**
     * Calculates the target fatigue for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the building. Number from 1 to 10.
     * @param {number} quality - The quality of the building.
     * @param {tagRACE} race - The race of the character.
     * @return {number} The target fatigue.
     */
    export function rest_target_fatigue(tier: number, quality: number, race: tagRACE) {
        let multiplier = 1
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.1
        return trim(Math.floor((100 - tier * 20) * multiplier), 0, 100)
    }

    /**
     * Calculates the target stress for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the building. Number from 1 to 10.
     * @param {number} quality - The quality of the building.
     * @param {tagRACE} race - The race of the character.
     * @return {number} The target stress.
     */
    export function rest_target_stress(tier: number, quality: number, race: tagRACE) {
        let multiplier = trim(1 - quality / 500, 0.5, 1)
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.1
        return trim(Math.floor((100 - tier * 10) * multiplier), 0, 100)
    }
}
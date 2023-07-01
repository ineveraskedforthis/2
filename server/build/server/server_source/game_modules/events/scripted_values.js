"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptedValue = void 0;
const data_1 = require("../data");
const basic_functions_1 = require("../calculations/basic_functions");
var ScriptedValue;
(function (ScriptedValue) {
    function building_rest_tier(type, character) {
        switch (type) {
            case "shack" /* LandPlotType.Shack */: return 4;
            case "inn" /* LandPlotType.Inn */: return 8;
            case "human_house" /* LandPlotType.HumanHouse */: return 10;
            case "rat_lair" /* LandPlotType.RatLair */: {
                if (character.race == 'rat')
                    return 10;
                return 1;
            }
            case "elodino_house" /* LandPlotType.ElodinoHouse */: {
                if (character.race == 'elo')
                    return 10;
                return 1;
            }
        }
        return 0;
    }
    ScriptedValue.building_rest_tier = building_rest_tier;
    function room_price(building_id, character) {
        let building = data_1.Data.Buildings.from_id(building_id);
        let owner_id = data_1.Data.Buildings.owner(building_id);
        if (owner_id == undefined)
            return 0;
        if (owner_id == character)
            return 0;
        return building.room_cost;
    }
    ScriptedValue.room_price = room_price;
    function building_price_wood(type) {
        switch (type) {
            case "shack" /* LandPlotType.Shack */: return 50;
            case "inn" /* LandPlotType.Inn */: return 400;
            case "human_house" /* LandPlotType.HumanHouse */: return 200;
            case "rat_lair" /* LandPlotType.RatLair */: return 0;
            case "elodino_house" /* LandPlotType.ElodinoHouse */: return 600;
            case "cotton_field" /* LandPlotType.CottonField */: return 800;
            case "farm_plot" /* LandPlotType.FarmPlot */: return 800;
            case "forest_plot" /* LandPlotType.ForestPlot */: return 800;
            case "land_plot" /* LandPlotType.LandPlot */: return 800;
        }
    }
    ScriptedValue.building_price_wood = building_price_wood;
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
    function rest_target_fatigue(tier, quality, race) {
        let multiplier = 1;
        if (race == 'rat')
            multiplier = 0.25;
        if (race == 'elo')
            multiplier = 0.5;
        if (race == 'graci')
            multiplier = 0.1;
        return (0, basic_functions_1.trim)(Math.floor((100 - tier * 20) * multiplier), 0, 100);
    }
    ScriptedValue.rest_target_fatigue = rest_target_fatigue;
    /**
     * Calculates the target stress for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the building. Number from 1 to 10.
     * @param {number} quality - The quality of the building.
     * @param {tagRACE} race - The race of the character.
     * @return {number} The target stress.
     */
    function rest_target_stress(tier, quality, race) {
        let multiplier = (0, basic_functions_1.trim)(1 - quality / 500, 0.5, 1);
        if (race == 'rat')
            multiplier = 0.25;
        if (race == 'elo')
            multiplier = 0.5;
        if (race == 'graci')
            multiplier = 0.1;
        return (0, basic_functions_1.trim)(Math.floor((100 - tier * 10) * multiplier), 0, 100);
    }
    ScriptedValue.rest_target_stress = rest_target_stress;
})(ScriptedValue = exports.ScriptedValue || (exports.ScriptedValue = {}));

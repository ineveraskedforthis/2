"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptedValue = void 0;
const data_1 = require("../data");
var ScriptedValue;
(function (ScriptedValue) {
    function building_rest_tier(type, character) {
        switch (type) {
            case "shack" /* BuildingType.Shack */: return 2;
            case "inn" /* BuildingType.Inn */: return 3;
            case "human_house" /* BuildingType.HumanHouse */: return 4;
            case "rat_lair" /* BuildingType.RatLair */: {
                if (character.race() == 'rat')
                    return 5;
                return 2;
            }
            case "elodino_house" /* BuildingType.ElodinoHouse */: {
                if (character.race() == 'elo')
                    return 5;
                return 2;
            }
        }
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
            case "shack" /* BuildingType.Shack */: return 50;
            case "inn" /* BuildingType.Inn */: return 400;
            case "human_house" /* BuildingType.HumanHouse */: return 200;
            case "rat_lair" /* BuildingType.RatLair */: return 0;
            case "elodino_house" /* BuildingType.ElodinoHouse */: return 600;
        }
    }
    ScriptedValue.building_price_wood = building_price_wood;
    function building_rooms(type) {
        switch (type) {
            case "shack" /* BuildingType.Shack */: return 1;
            case "inn" /* BuildingType.Inn */: return 5;
            case "human_house" /* BuildingType.HumanHouse */: return 2;
            case "rat_lair" /* BuildingType.RatLair */: return 10;
            case "elodino_house" /* BuildingType.ElodinoHouse */: return 10;
        }
    }
    ScriptedValue.building_rooms = building_rooms;
    function rest_target_fatigue(tier, quality, race) {
        let multiplier = 1;
        if (race == 'rat')
            multiplier = 0.25;
        if (race == 'elo')
            multiplier = 0.5;
        if (race == 'graci')
            multiplier = 0.1;
        return Math.floor((5 - tier) * 5 * (200 - quality) / 100 * multiplier);
    }
    ScriptedValue.rest_target_fatigue = rest_target_fatigue;
    function rest_target_stress(tier, quality, race) {
        let multiplier = 1;
        if (race == 'rat')
            multiplier = 0.25;
        if (race == 'elo')
            multiplier = 0.5;
        if (race == 'graci')
            multiplier = 0.1;
        return Math.floor((5 - tier) * 15 * (200 - quality) / 100 * multiplier);
    }
    ScriptedValue.rest_target_stress = rest_target_stress;
})(ScriptedValue = exports.ScriptedValue || (exports.ScriptedValue = {}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptedValue = void 0;
const data_1 = require("../data");
var ScriptedValue;
(function (ScriptedValue) {
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
    function building_price_wood(tier) {
        return tier * tier * 50;
    }
    ScriptedValue.building_price_wood = building_price_wood;
    function rest_target_fatigue(tier, quality, race) {
        let multiplier = 1;
        if (race == 'rat')
            multiplier = 0.25;
        if (race == 'elo')
            multiplier = 0.5;
        if (race == 'graci')
            multiplier = 0.9;
        return Math.floor((5 - tier) * 6 * (200 - quality) / 100 * multiplier);
    }
    ScriptedValue.rest_target_fatigue = rest_target_fatigue;
    function rest_target_stress(tier, quality, race) {
        let multiplier = 1;
        if (race == 'rat')
            multiplier = 0.25;
        if (race == 'elo')
            multiplier = 0.5;
        if (race == 'graci')
            multiplier = 0.9;
        return Math.floor((5 - tier) * 15 * (200 - quality) / 100 * multiplier);
    }
    ScriptedValue.rest_target_stress = rest_target_stress;
})(ScriptedValue = exports.ScriptedValue || (exports.ScriptedValue = {}));

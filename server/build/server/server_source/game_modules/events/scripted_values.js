"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptedValue = void 0;
const basic_functions_1 = require("../calculations/basic_functions");
var ScriptedValue;
(function (ScriptedValue) {
    ScriptedValue.max_devastation = 100;
    function rest_price(character, location) {
        if (location.owner_id == character.id)
            return 0;
        return location.has_house_level * 10;
    }
    ScriptedValue.rest_price = rest_price;
    function rest_tier(character, location) {
        if (character.race == 'ball') {
            return 5;
        }
        if (character.race == 'rat') {
            return location.has_rat_lair ? 10 : 1;
        }
        let base = 0;
        if (character.race != "elo") {
            base += location.has_bed ? 1 : 0;
        }
        else {
            base += 1;
        }
        base += location.has_house_level;
        return base;
    }
    ScriptedValue.rest_tier = rest_tier;
    /**
     * Calculates the target fatigue for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the location. Number from 1 to 10.
     * @param {number} quality - The quality of the location.
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
        return (0, basic_functions_1.trim)(Math.floor((50 - tier * 20) * multiplier), 0, 100);
    }
    ScriptedValue.rest_target_fatigue = rest_target_fatigue;
    /**
     * Calculates the target fatigue for a given location.
     *
     * @param {Character} character - Character which plans to rest there
     * @param {LocationInterface} location - Location
     * @return {number} The target fatigue.
     */
    function target_fatigue(character, location) {
        return rest_target_fatigue(rest_tier(character, location), ScriptedValue.max_devastation - location.devastation, character.race);
    }
    ScriptedValue.target_fatigue = target_fatigue;
    /**
     * Calculates the target stress for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the location. Number from 1 to 10.
     * @param {number} quality - The quality of the location.
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
        return (0, basic_functions_1.trim)(Math.floor((75 - tier * 10) * multiplier), 0, 100);
    }
    ScriptedValue.rest_target_stress = rest_target_stress;
    /**
     * Calculates the target stress for a given location.
     *
     * @param {Character} character - Character which plans to rest there
     * @param {LocationInterface} location - Location
     * @return {number} The target fatigue.
     */
    function target_stress(character, location) {
        return rest_target_stress(rest_tier(character, location), ScriptedValue.max_devastation - location.devastation, character.race);
    }
    ScriptedValue.target_stress = target_stress;
})(ScriptedValue || (exports.ScriptedValue = ScriptedValue = {}));


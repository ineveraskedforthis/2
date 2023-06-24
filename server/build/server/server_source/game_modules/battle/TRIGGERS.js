"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleTriggers = void 0;
const SYSTEM_REPUTATION_1 = require("../SYSTEM_REPUTATION");
const data_1 = require("../data");
const racial_hostility_1 = require("../races/racial_hostility");
const systems_communication_1 = require("../systems_communication");
var BattleTriggers;
(function (BattleTriggers) {
    /** Checks if there is only one team left */
    function safe(battle) {
        const teams = {};
        for (const unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            if (character == undefined)
                continue;
            if (character.dead())
                continue;
            if (teams[unit.team] == undefined)
                teams[unit.team] = 1;
            else
                teams[unit.team] += 1;
        }
        const total = Object.values(teams);
        if (total.length > 1)
            return false;
        return true;
    }
    BattleTriggers.safe = safe;
    function safe_expensive(battle) {
        for (const unit of Object.values(battle.heap.data)) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            if (!safe_for_unit(battle, unit, character))
                return false;
        }
        return true;
    }
    BattleTriggers.safe_expensive = safe_expensive;
    function safe_for_unit(battle, unit, character) {
        for (const item of Object.values(battle.heap.data)) {
            if (is_enemy(unit, character, item, systems_communication_1.Convert.unit_to_character(item))) {
                return false;
            }
        }
        return true;
    }
    BattleTriggers.safe_for_unit = safe_for_unit;
    /**
     * Checks if unit should consider other unit as a target.
     * @param unit
     * @param unit_char
     * @param potential_enemy
     * @param potential_enemy_char
     * @returns
     */
    function is_enemy(unit, character, target, target_character) {
        if (target == undefined) {
            // console.log('undefined target')
            return false;
        }
        // team check
        if (unit.team == target.team) {
            // console.log('same team')
            return false;
        }
        return (0, SYSTEM_REPUTATION_1.is_enemy_characters)(character, target_character);
    }
    BattleTriggers.is_enemy = is_enemy;
    function is_friend(character, potential_friend_of_character) {
        if (potential_friend_of_character.dead()) {
            return false;
        }
        if ((0, racial_hostility_1.hostile)(character.race(), potential_friend_of_character.race())) {
            return false;
        }
        if (data_1.Data.Reputation.a_X_b(character.id, 'friend', potential_friend_of_character.id)) {
            return true;
        }
        if (data_1.Data.Reputation.a_X_b(character.id, 'member', potential_friend_of_character.id)) {
            return true;
        }
        return false;
    }
    BattleTriggers.is_friend = is_friend;
})(BattleTriggers = exports.BattleTriggers || (exports.BattleTriggers = {}));

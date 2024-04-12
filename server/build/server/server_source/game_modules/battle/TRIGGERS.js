"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleTriggers = void 0;
const SYSTEM_REPUTATION_1 = require("../SYSTEM_REPUTATION");
const data_id_1 = require("../data/data_id");
const data_objects_1 = require("../data/data_objects");
const racial_hostility_1 = require("../races/racial_hostility");
var BattleTriggers;
(function (BattleTriggers) {
    /** Checks if there is only one team left */
    function safe(battle) {
        const teams = {};
        for (const unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            if (character.dead())
                continue;
            if (teams[character.team] == undefined)
                teams[character.team] = 1;
            else
                teams[character.team] += 1;
        }
        const total = Object.values(teams);
        if (total.length > 1)
            return false;
        return true;
    }
    BattleTriggers.safe = safe;
    function safe_expensive(battle) {
        for (const unit of battle.heap) {
            if (unit == undefined)
                continue;
            const character = data_objects_1.Data.Characters.from_id(unit);
            if (!safe_for_unit(battle, character))
                return false;
        }
        return true;
    }
    BattleTriggers.safe_expensive = safe_expensive;
    function safe_for_unit(battle, unit) {
        for (const item of battle.heap) {
            if (item == undefined)
                continue;
            if (is_enemy(unit, data_objects_1.Data.Characters.from_id(item))) {
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
    function is_enemy(unit, target) {
        if (target == undefined) {
            // console.log('undefined target')
            return false;
        }
        // team check
        if (unit.team == target.team) {
            // console.log('same team')
            return false;
        }
        return (0, SYSTEM_REPUTATION_1.is_enemy_characters)(unit, target);
    }
    BattleTriggers.is_enemy = is_enemy;
    function is_friend(character, potential_friend_of_character) {
        if (potential_friend_of_character.dead()) {
            return false;
        }
        if ((0, racial_hostility_1.hostile)(character.race, potential_friend_of_character.race)) {
            return false;
        }
        if (data_id_1.DataID.Reputation.a_X_b(character.id, 'friend', potential_friend_of_character.id)) {
            return true;
        }
        if (data_id_1.DataID.Reputation.a_X_b(character.id, 'member', potential_friend_of_character.id)) {
            return true;
        }
        return false;
    }
    BattleTriggers.is_friend = is_friend;
})(BattleTriggers = exports.BattleTriggers || (exports.BattleTriggers = {}));

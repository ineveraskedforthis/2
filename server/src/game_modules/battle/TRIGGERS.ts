import { is_enemy_characters } from "../SYSTEM_REPUTATION"
import { Character } from "../character/character"
import { DataID } from "../data/data_id"
import { Data } from "../data/data_objects"
import { hostile } from "../races/racial_hostility"
import { Battle } from "./classes/battle"

export namespace BattleTriggers {
    /** Checks if there is only one team left */
    export function safe(battle: Battle): boolean {
        const teams:{[_ in number]: number} = {}
        for (const unit of battle.heap) {
            if (unit == undefined) continue;
            const character = Data.Characters.from_id(unit)
            if (character.dead()) continue

            if (teams[character.team] == undefined) teams[character.team] = 1
            else teams[character.team] += 1
        }
        const total = Object.values(teams)
        if (total.length > 1) return false
        return true
    }

    export function safe_expensive(battle: Battle): boolean {
        for (const unit of battle.heap) {
            if (unit == undefined) continue;
            const character = Data.Characters.from_id(unit)
            if (!safe_for_unit(battle, character)) return false
        }

        return true
    }

    export function safe_for_unit(battle: Battle, unit: Character): boolean {
        for (const item of battle.heap) {
            if (item == undefined) continue;
            if (is_enemy(unit, Data.Characters.from_id(item))) {
                return false
            }
        }
        return true
    }

    /**
     * Checks if unit should consider other unit as a target.
     * @param unit
     * @param unit_char
     * @param potential_enemy
     * @param potential_enemy_char
     * @returns
     */
    export function is_enemy(unit: Character, target: Character) {
        if (target == undefined){
            // console.log('undefined target')
            return false
        }

        // team check
        if (unit.team == target.team)
        {
            // console.log('same team')
            return false
        }

        return is_enemy_characters(unit, target)
    }

    export function is_friend(character: Character, potential_friend_of_character: Character) {
        if (potential_friend_of_character.dead()) {
            return false
        }

        if (hostile(character.race, potential_friend_of_character.race)) {
            return false
        }

        if (DataID.Reputation.a_X_b(character.id, 'friend', potential_friend_of_character.id)) {
            return true
        }

        if (DataID.Reputation.a_X_b(character.id, 'member', potential_friend_of_character.id)) {
            return true
        }

        return false
    }
}
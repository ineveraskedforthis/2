import { Character } from "../character/character"
import { Data } from "../data"
import { hostile } from "../races/racial_hostility"
import { Convert } from "../systems_communication"
import { Battle } from "./classes/battle"
import { Unit } from "./classes/unit"

export namespace BattleTriggers {
    /** Checks if there is only one team left */
    export function safe(battle: Battle): boolean {
        const teams:{[_ in number]: number} = {}
        for (const unit of Object.values(battle.heap.data)) {
            const character = Convert.unit_to_character(unit)
            if (character == undefined) continue
            if (character.dead()) continue

            if (teams[unit.team] == undefined) teams[unit.team] = 1
            else teams[unit.team] += 1
        }
        const total = Object.values(teams)
        if (total.length > 1) return false
        return true 
    }

    export function safe_expensive(battle: Battle): boolean {
        for (const unit of Object.values(battle.heap.data)) {
            const character = Convert.unit_to_character(unit)
            if (!safe_for_unit(battle, unit, character)) return false
        }

        return true
    }

    export function safe_for_unit(battle: Battle, unit: Unit, character: Character): boolean {
        for (const item of Object.values(battle.heap.data)) {
            if (is_enemy(unit, character, item, Convert.unit_to_character(item))) {
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
    export function is_enemy(unit: Unit, character: Character, target: Unit|undefined, target_character: Character) {
        if (target == undefined)
            return false
        // team check
        if (unit.team == target.team)
            return false

        // death check
        if (target_character.dead()) 
            return false
        if (character.dead())
            return false

        // hostility check:
        // if there is no racial hostility, then check for reputational hostility
        if (!hostile(character.race(), target_character.race())) {
            // we know that they are not hostile because of race.
            // so we check if there b has bad reputation with a's faction
            if (!Data.Reputation.a_is_enemy_of_b(character.id, target_character.id)) {
                // if he is not a racial enemy and not an reputational enemy, then he is not an enemy
                // being in separate teams must be just an accident
                // i should consider tracking personal relationships
                return false
            }
        }

        // otherwise, he is an enemy
        return true
    }

    export function is_friend(character: Character, potential_friend_of_character: Character) {
        if (potential_friend_of_character.dead()) {
            return false
        }

        if (hostile(character.race(), potential_friend_of_character.race())) {
            return false
        }

        if (Data.Reputation.a_X_b(character.id, 'friend', potential_friend_of_character.id)) {
            return true
        }

        if (Data.Reputation.a_X_b(character.id, 'member', potential_friend_of_character.id)) {
            return true
        }

        return false
    }
}
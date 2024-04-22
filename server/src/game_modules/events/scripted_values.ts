import { tagRACE } from "../types";
import { trim } from "../calculations/basic_functions";
import { LocationInterface } from "../location/location_interface";
import { money } from "@custom_types/common";
import { Character } from "../character/character";
import { Data } from "../data/data_objects";
import { CharacterSystem } from "../character/system";

export namespace ScriptedValue {
    export const max_devastation = 100

    export function rest_quality(location: LocationInterface) : number {
        return max_devastation - location.devastation
    }

    export function rest_price(character: Character, location: LocationInterface) : money {
        if (location.owner_id == character.id) return 0 as money;
        if (location.owner_id == undefined) return 0 as money;
        const location_owner = Data.Characters.from_id(location.owner_id)
        if (location_owner.location_id != character.location_id) return 0 as money
        return location.has_house_level * 10 as money;
    }

    export function rest_tier(character: Character, location: LocationInterface): number {
        if (character.race == 'ball') {
            return 5
        }

        if (character.race == 'rat') {
            return location.has_rat_lair ? 10 : 1
        }

        let base = 0

        if (character.race != "elo") {
            base += location.has_bed ? 1 : 0
        } else {
            base += 1
        }

        base += location.has_house_level

        return base
    }

    /**
     * Calculates the target fatigue for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the location. Number from 1 to 10.
     * @param {number} quality - The quality of the location.
     * @param {tagRACE} race - The race of the character.
     * @return {number} The target fatigue.
     */
    export function rest_target_fatigue(tier: number, quality: number, race: tagRACE): number {
        let multiplier = 1
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.1
        return trim(Math.floor((50 - tier * 20) * multiplier / Math.log(4 + quality)), 0, 100)
    }

    /**
     * Calculates the target fatigue for a given location.
     *
     * @param {Character} character - Character which plans to rest there
     * @param {LocationInterface} location - Location
     * @return {number} The target fatigue.
     */
    export function target_fatigue(character: Character, location: LocationInterface): number {
        const skill = CharacterSystem.skill(character, 'travelling')

        return rest_target_fatigue(
            rest_tier(character, location),
            ScriptedValue.rest_quality(location) + skill,
            character.race
        )
    }

    /**
     * Calculates the target stress for a given tier, quality, and race.
     *
     * @param {number} tier - The tier of the location. Number from 1 to 10.
     * @param {number} quality - The quality of the location.
     * @param {tagRACE} race - The race of the character.
     * @return {number} The target stress.
     */
    export function rest_target_stress(tier: number, quality: number, race: tagRACE): number {
        let multiplier = trim(1 - quality / 500, 0.5, 1)
        if (race == 'rat') multiplier = 0.25
        if (race == 'elo') multiplier = 0.5
        if (race == 'graci') multiplier = 0.1
        return trim(Math.floor((75 - tier * 10) * multiplier), 0, 100)
    }

    /**
     * Calculates the target stress for a given location.
     *
     * @param {Character} character - Character which plans to rest there
     * @param {LocationInterface} location - Location
     * @return {number} The target fatigue.
     */
    export function target_stress(character: Character, location: LocationInterface): number {
        const skill = CharacterSystem.skill(character, 'travelling')

        return rest_target_stress(
            rest_tier(character, location),
            ScriptedValue.rest_quality(location) + Math.floor(skill / 5),
            character.race
        )
    }
}
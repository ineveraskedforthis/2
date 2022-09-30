import { Character } from "../base_game_classes/character/character"

export const COOK_ELODINO_DIFFICULTY = 50
export const COOK_RAT_DIFFICULTY  = 20
export const RAT_SKIN_DIFFICULTY = 20
export const BASIC_WOOD_DIFFICULTY = 10

export namespace CraftProbability {
    export function from_rat_skin(character: Character) {
        if (character.perks.skin_armour_master) return 1
        let skill = character.skills.clothier
        return Math.min(character.skills.clothier / RAT_SKIN_DIFFICULTY, 1)
    }

    export function meat_to_food(character: Character) {
        if (character.perks.meat_master) {
            var res = 1
        } else {
            var res = check(character.skills.cooking, COOK_RAT_DIFFICULTY)
        }
        return Math.min(res, 1)
    }

    export function elo_to_food(character: Character) {
        let base = 0;
        if (character.perks.meat_master) {
            base += 0.2
        }
        let worst_skill = Math.min(character.skills.cooking, character.skills.magic_mastery)
        return Math.min(base + check(worst_skill, COOK_ELODINO_DIFFICULTY), 1)
    }

    export function basic_wood(character: Character) {
        return Math.min(1, check(character.skills.woodwork, BASIC_WOOD_DIFFICULTY))
    }

    export function arrow(character: Character) {
        if (character.perks.fletcher) return 1
        return Math.min(1, check(character.skills.woodwork, BASIC_WOOD_DIFFICULTY))
    }

    function check(skill: number, difficulty: number) {
        return skill / difficulty
    }
}
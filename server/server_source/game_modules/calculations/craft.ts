import { Character } from "../character/character"
import { trim } from "./basic_functions"

export const COOK_ELODINO_DIFFICULTY = 30
export const EXTRACT_ZAZ_DIFFICULTY = 30
export const COOK_RAT_DIFFICULTY  = 20
export const RAT_SKIN_DIFFICULTY = 20
export const BASIC_WOOD_DIFFICULTY = 30

const ARROWS_DIFFICULTY = 30
const ARROW_BASE = 10

const MEAT_TO_FOOD = 3
const ELODINO_TO_FOOD = 2
const ELODINO_TO_ZAZ = 1



export namespace Craft {
    export namespace Amount {
        export namespace Cooking {
            export function meat(character: Character) {
                const ratio = ratio_from_skill(character.skills.cooking, COOK_RAT_DIFFICULTY)
                let base_amount = Math.round(ratio * MEAT_TO_FOOD)
                if (character.perks.meat_master) base_amount += 1
                return base_amount + 1
            }

            export function elodino(character: Character) {
                const ratio = ratio_from_skill(character.skills.cooking, COOK_ELODINO_DIFFICULTY)
                let base_amount = Math.round(ratio * ELODINO_TO_FOOD)
                if (character.perks.meat_master) base_amount += 1
                return base_amount
            }
        }

        export function elodino_zaz_extraction(character: Character) {
            const ratio = ratio_from_skill(character.skills.magic_mastery, EXTRACT_ZAZ_DIFFICULTY)
            let base_amount = Math.round(ratio * ELODINO_TO_ZAZ)
            if (character.perks.mage_initiation) base_amount += 1
            return base_amount
        }

        export function arrow(character: Character) {
            let skill = character.skills.woodwork
            if (character.perks.fletcher) skill += 10
            
            return Math.round(ARROW_BASE * ratio_from_skill(skill, ARROWS_DIFFICULTY))
        }

        export function ratio_from_skill(skill: number, difficulty: number) {
            return trim(skill / difficulty, 0, 10)
        }
    }

    export namespace Durability {
        export function wood_item(character: Character) {
            return from_skill(character.skills.woodwork, BASIC_WOOD_DIFFICULTY)  
        }

        export function skin_item(character: Character) {
            let durability = from_skill(character.skills.clothier, RAT_SKIN_DIFFICULTY)
            if (character.perks.skin_armour_master) durability += 10
            return durability
        }

        export function from_skill(skill: number, difficulty: number) {
            const base = Math.round(skill / difficulty * 100)
            return trim(base, 10, 100)
        }
    }
}

// export namespace CraftProbability {
//     export function from_rat_skin(character: Character) {
//         if (character.perks.skin_armour_master) return 1
//         let skill = character.skills.clothier
//         return Math.min(character.skills.clothier / RAT_SKIN_DIFFICULTY, 1)
//     }

//     export function meat_to_food(character: Character) {
//         if (character.perks.meat_master) {
//             var res = 1
//         } else {
//             var res = check(character.skills.cooking, COOK_RAT_DIFFICULTY)
//         }
//         return Math.min(res, 1)
//     }

//     export function elo_to_food(character: Character) {
//         let base = 0;
//         if (character.perks.meat_master) {
//             base += 0.2
//         }
//         let worst_skill = Math.min(character.skills.cooking, character.skills.magic_mastery)
//         return Math.min(base + check(worst_skill, COOK_ELODINO_DIFFICULTY), 1)
//     }

//     export function basic_wood(character: Character) {
//         return Math.min(1, check(character.skills.woodwork, BASIC_WOOD_DIFFICULTY))
//     }

//     export function arrow(character: Character) {
//         if (character.perks.fletcher) return 1
//         return Math.min(1, check(character.skills.woodwork, BASIC_WOOD_DIFFICULTY))
//     }

//     function check(skill: number, difficulty: number) {
//         return skill / difficulty
//     }
// }
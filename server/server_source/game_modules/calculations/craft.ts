import { Character } from "../character/character"
import { trim } from "./basic_functions"

const ARROW_BASE = 10
const MEAT_TO_FOOD = 3
const ELODINO_TO_FOOD = 2
const ELODINO_TO_ZAZ = 1

export namespace Craft {
    export namespace Amount {
        export namespace Cooking {
            export function meat(character: Character, tier: number) {
                const ratio = ratio_from_skill(character.skills.cooking, tier)
                let base_amount = Math.round(ratio * MEAT_TO_FOOD)
                if (character.perks.meat_master) base_amount += 1
                return base_amount + 1
            }

            export function elodino(character: Character, tier: number) {
                const ratio = ratio_from_skill(character.skills.cooking, tier)
                let base_amount = Math.round(ratio * ELODINO_TO_FOOD)
                if (character.perks.meat_master) base_amount += 1
                if (character.perks.alchemist) base_amount += 1
                return base_amount
            }
        }

        export function textile(character: Character, tier: number) {
            return ratio_from_skill(character.skills.clothier, tier)
        }

        export function elodino_zaz_extraction(character: Character, tier: number) {
            const ratio = ratio_from_skill(character.skills.magic_mastery, tier)
            let base_amount = Math.round(ratio * ELODINO_TO_ZAZ)
            if (character.perks.mage_initiation) base_amount += 1
            if (character.perks.alchemist) base_amount += 2
            return base_amount
        }

        export function arrow(character: Character, tier: number) {
            let skill = character.skills.woodwork
            if (character.perks.fletcher) skill += 10
            return Math.round(ARROW_BASE * ratio_from_skill(skill, tier))
        }

        export function ratio_from_skill(skill: number, difficulty: number) {
            return trim(skill / difficulty, 0, 10)
        }
    }

    export namespace Durability {
        export function wood_item(character: Character, tier: number) {
            return from_skill(character.skills.woodwork, tier)  
        }

        export function bone_item(character: Character, tier: number) {
            return from_skill(character.skills.bone_carving, tier)  
        }

        export function skin_item(character: Character, tier: number) {
            let durability = from_skill(character.skills.clothier, tier)
            if (character.perks.skin_armour_master) durability += 10
            return durability
        }

        export function metal_weapon(character: Character, tier: number) {
            return from_skill(character.skills.smith, tier)
        }

        export function from_skill(skill: number, difficulty: number) {
            const base = Math.round(skill / difficulty * 100)
            return trim(base, 5, 150)
        }
    }
}
import { MATERIAL_CATEGORY, MaterialData } from "@content/content"
import { Character } from "../data/entities/character"
import { CraftBulkTemplate, CraftItemTemplate } from "@custom_types/inventory"

export namespace CharacterCondition {
    export function can_eat(character: Character, material: MaterialData) : boolean {
        if (character.race == "rat") {
            if (material.category == MATERIAL_CATEGORY.MEAT) return true
            if (material.category == MATERIAL_CATEGORY.PLANT) return true
        }

        if (material.category == MATERIAL_CATEGORY.FRUIT) return true
        if (material.category == MATERIAL_CATEGORY.FOOD) return true

        return false
    }

    export function can_bulk_craft(character: Character, craft: CraftBulkTemplate) {
        for (const item of craft.input) {
            if (character.stash.get(item.material) < item.amount) {
                return false
            }
        }

        return true
    }

    export function can_item_craft(character: Character, craft: CraftItemTemplate) {
        for (const item of craft.input) {
            if (character.stash.get(item.material) < item.amount) {
                return false
            }
        }

        return true
    }
}
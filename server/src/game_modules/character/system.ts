import { MATERIAL, MATERIAL_CATEGORY, MaterialConfiguration, MaterialStorage } from "@content/content";
import { location_id } from "@custom_types/ids";
import { decide } from "../AI/Decide/decide";
import { Damage } from "../Damage";
import { trim } from "../calculations/basic_functions";
import { damage_types } from "../damage_types";
import { Data } from "../data/data_objects";
import { Character } from "../data/entities/character";
import { Equip } from "../data/entities/equip";
import { Savings } from "../data/entities/savings";
import { Stash } from "../data/entities/stash";
import { CHANGE_REASON, Effect } from "../effects/effects";
import { Loot } from "../races/generate_loot";
import { CharacterValues } from "../scripted-values/character";
import { CharacterTemplate } from "../types";
var ai_campaign_decision_timer = 0
var character_state_update_timer = 0

export namespace CharacterSystem {

    export function template_to_character(template: CharacterTemplate, name: string|undefined, location: location_id) {
        if (name == undefined) name = template.name_generator();
        const character = Data.Characters.create(location, name, template)
        character.explored[character.cell_id] = true

        for (const cell_id of Data.World.neighbours(character.cell_id)) {
            character.explored[cell_id] = true
        }

        return character
    }




    /**
     * Damages character, accounting for resistances
     * @param character Damaged character
     * @param damage damage
     * @param reason Reason of damage
     * @returns total damage dealt
     */
    export function damage(character: Character, damage: Damage, reason: CHANGE_REASON) {
        let total = 0
        let resistance = CharacterValues.resistance(character)
        for (let tag of damage_types) {
            const damage_curr = trim(damage[tag] - resistance[tag], 0, 100000)
            Effect.Change.hp(character, -damage_curr, reason)
            total += damage_curr
        }
        return total
    }

    export function is_empty_inventory(target: {stash: Stash, savings: Savings, equip: Equip}): boolean {
        return (target.savings.get() == 0) && target.stash.is_empty() && target.equip.is_empty()
    }

    export function transfer_all(origin:{stash: Stash, savings: Savings, equip: Equip}, target: {stash: Stash, savings: any, equip: any}) {
        origin.stash.transfer_all(target.stash)
        origin.savings.transfer_all(target.savings)
        origin.equip.transfer_all(target)
    }

    export function rgo_check(character: Character):{material: MATERIAL, amount: number}[] {
        const loot = Loot.base(character.model)
        return loot
    }

    export function update(dt: number) {
        ai_campaign_decision_timer += dt
        character_state_update_timer += dt

        if (ai_campaign_decision_timer > 8) {
            decide()
            ai_campaign_decision_timer = 0
        }

        if (character_state_update_timer > 10) {
            Data.Characters.for_each((character) => {
                if (character.dead()) {
                    return
                }
                if (!character.in_battle()) {
                    Effect.Change.rage(character, -2, CHANGE_REASON.REST);
                }
                // spoilage
                for (const material_id of MaterialConfiguration.MATERIAL) {
                    const material = MaterialStorage.get(material_id)
                    if (material.category == MATERIAL_CATEGORY.FISH) Effect.spoilage(character, material_id, 0.01)
                    if (material.category == MATERIAL_CATEGORY.MEAT) Effect.spoilage(character, material_id, 0.01)
                    if (material.category == MATERIAL_CATEGORY.FRUIT) Effect.spoilage(character, material_id, 0.01)
                    if (material.category == MATERIAL_CATEGORY.FOOD) Effect.spoilage(character, material_id, 0.001)
                }
                // hunger
                {
                    if (character.hp_max < character.hp * 2) {
                        Effect.Change.hp(character, -1, CHANGE_REASON.HUNGER)
                    } else {
                        Effect.Change.fatigue(character, 1, CHANGE_REASON.HUNGER)
                    }
                }
            })

            character_state_update_timer = 0
        }
    }
    export function battle_update(character: Character) {

    }
}
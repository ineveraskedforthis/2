import { skill } from "@custom_types/inventory";
import { CharacterTemplate } from "../types";
import { melee_attack_type } from "@custom_types/common";
import { location_id } from "@custom_types/ids";
import { Equip } from "../inventories/equip";
import { Savings } from "../inventories/savings";
import { Stash } from "../inventories/stash";
import { damage_types, DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Character } from "./character";
import { Loot } from "../races/generate_loot";
import { CampaignAI } from "../AI/ai_manager";
import { trim } from "../calculations/basic_functions";
import { CHANGE_REASON, Effect } from "../effects/effects";
import { money } from "@custom_types/common";
import { is_melee_skill } from "./SkillList";
import { Perks } from "@custom_types/character";
import { BaseStats } from "../races/stats";
import { BaseResists } from "../races/resists";
import { ItemSystem } from "../systems/items/item_system";
import { Data } from "../data/data_objects";
import { EQUIP_SLOT, IMPACT_TYPE, MATERIAL, MATERIAL_CATEGORY, MaterialConfiguration, MaterialStorage } from "@content/content";
import { weapon_skill_tag } from "../client_communication/network_actions/updates";
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

    export function pure_skill(character: Character, skill: skill) {
        let result = character._skills[skill]
        if (result == undefined) {
            result = 0
        }
        return result
    }

    export function skill(character: Character, skill: skill) {
        let result = character._skills[skill]
        if (result == undefined) {
            result = 0
        }

        let location = Data.Locations.from_id(character.location_id)

        if (location.has_cooking_tools && skill == 'cooking') {
            result = (result + 5) * 1.2
        }

        if (location.has_bowmaking_tools && skill == 'woodwork') {
            result = (result + 5) * 1.2
        }

        if (location.has_clothier_tools && skill == 'clothier') {
            result = (result + 5) * 1.2
        }

        if (skill == 'ranged') {
            const rage_mod = (100 - character.get_rage()) / 100
            const stress_mod = (100 - character.get_stress()) / 100
            const fatigue_mod = (100 - character.get_fatigue()) / 100
            result = result * rage_mod * stress_mod * fatigue_mod
        }

        if (is_melee_skill(skill)) {
            const rage_mod = (100 - character.get_rage()) / 100
            const stress_mod = (100 - character.get_stress()) / 100
            const fatigue_mod = (100 - character.get_fatigue()) / 100
            result = result * rage_mod * stress_mod * fatigue_mod
        }

        return trim(Math.round(result), 0, 100)
    }

    export function melee_damage_raw(character: Character, type: melee_attack_type) {
        const weapon_damage = character.equip.get_melee_damage(type)
        if (weapon_damage != undefined) {
            if (character._perks.advanced_polearm) {
                if (CharacterSystem.equiped_weapon_impact_type(character) == IMPACT_TYPE.POINT) {
                    DmgOps.mult_ip(weapon_damage, 1.2)
                }
            }
            return weapon_damage
        }

        //handle case of unarmed
        const damage = new Damage()
        if (type == 'blunt')    {
            if (character._perks.advanced_unarmed) {damage.blunt = 40} else {damage.blunt = 15}
        }
        if (type == 'slice')    {
            if (character._traits.claws) {damage.slice = 20} else {damage.slice = 2}
        }
        if (type == 'pierce')   {damage.pierce  = 0}
        return damage
    }

    export function ranged_damage_raw(character: Character) {
        const damage = character.equip.get_ranged_damage()
        if (damage != undefined) return damage
        return new Damage()
    }

    export function base_phys_power(character: Character) {
        return BaseStats[character.stats].phys_power
    }

    export function phys_power(character: Character) {
        let base = base_phys_power(character)
        base += skill(character, 'travelling') / 30
        base += skill(character, 'noweapon') / 50
        base += skill(character, 'fishing') / 50
        base += skill(character, 'ranged') / 60
        base += skill(character, 'woodwork') / 40
        base += (skill(character, 'onehand') + skill(character, 'polearms') + skill(character, 'twohanded')) / 50
        return Math.floor(base * character.equip.get_phys_power_modifier())
    }

    export function base_magic_power(character: Character) {
        return BaseStats[character.stats].magic_power
    }

    export function magic_power(character: Character) {
        let result = base_magic_power(character) + character.equip.get_magic_power()
        if (character._perks.mage_initiation) result += 5
        if (character._perks.magic_bolt) result += 3
        if (character._perks.blood_mage) {
            const blood_mod = character.status.blood / 50
            result = Math.round(result * (1 + blood_mod))
        }
        return result
    }

    export function perk(character: Character, tag: Perks) {
        return character._perks[tag] == true
    }

    export function enchant_rating(character: Character): number {
        let enchant_rating = CharacterSystem.magic_power(character) * (1 + skill(character, 'magic_mastery') / 100)
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character._perks.mage_initiation) {
            enchant_rating = enchant_rating * 2
        }

        return enchant_rating
    }

    // TODO
    function weight(character: Character): number {
        return 1
    }

    function movement_speed_battle(character: Character): number {
        let speed = BaseStats[character.stats].movement_speed
        speed = speed * (2 - character.get_fatigue() / 100) * boots_speed_multiplier(character)

        return speed
    }

    export function movement_cost_battle(character: Character): number {
        return (2.5 / movement_speed_battle(character))
    }

    export function boots_speed_multiplier(character: Character): number {
        let base = 0.75

        const boots_id = character.equip.data.slots[EQUIP_SLOT.BOOTS]

        if (boots_id != undefined) {
            const boots = Data.Items.from_id(boots_id)
            base = base + boots.durability / 200
        }

        return base
    }

    export function movement_duration_map(character: Character): number {
        let duration = 1
        duration += character.get_fatigue() / 100
        duration = duration / boots_speed_multiplier(character)
        duration = duration * (1 - skill(character, 'travelling') / 200)

        return duration
    }

    export function attack_skill(character: Character) {
        return skill(character, equiped_weapon_required_skill(character))
    }

    export function resistance(character: Character) {
        let result = BaseResists[character.resists]
        result = DmgOps.add(result, character.equip.resists())
        return result
    }

    export function equiped_weapon_impact_type(character: Character):IMPACT_TYPE {
        const weapon = character.equip.weapon
        if (weapon == undefined) {
            return IMPACT_TYPE.NONE;
        }
        return weapon.prototype.impact;
    }

    export function equiped_weapon_required_skill_melee(character: Character):weapon_skill_tag {
        const weapon = character.equip.weapon

        if (weapon == undefined) {
            return "noweapon"
        }

        if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
            return "polearms"
        }

        if (ItemSystem.weight(weapon) > phys_power(character)) {
            return "twohanded"
        }

        return "onehand"
    }

    export function equiped_weapon_required_skill(character: Character):skill {
        const weapon = character.equip.weapon

        if (weapon == undefined) {
            return "noweapon"
        }

        if (weapon.prototype.bow_power > 0) {
            return "ranged"
        }

        if (weapon.prototype.impact == IMPACT_TYPE.POINT) {
            return "polearms"
        }

        if (ItemSystem.weight(weapon) > phys_power(character)) {
            return "twohanded"
        }

        return "onehand"
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
        let resistance = CharacterSystem.resistance(character)
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
            Data.Characters.for_each((character) => {
                if (character.dead()) {
                    return
                }
                if (Math.random() > 0.6) {
                    CampaignAI.decision(character)
                }
            })
            ai_campaign_decision_timer = 0
        }


        if (character_state_update_timer > 10) {
            Data.Characters.for_each((character) => {
                if (character.dead()) {
                    return
                }
                if (!character.in_battle()) {
                    Effect.Change.rage(character, -1, CHANGE_REASON.REST)
                    Effect.rest_location_tick(character)
                    for (const material_id of MaterialConfiguration.MATERIAL) {
                        const material = MaterialStorage.get(material_id)
                        if (material.category == MATERIAL_CATEGORY.FISH) Effect.spoilage(character, material_id, 0.01)
                        if (material.category == MATERIAL_CATEGORY.MEAT) Effect.spoilage(character, material_id, 0.01)
                        if (material.category == MATERIAL_CATEGORY.FRUIT) Effect.spoilage(character, material_id, 0.01)
                        if (material.category == MATERIAL_CATEGORY.FOOD) Effect.spoilage(character, material_id, 0.001)
                    }
                }
            })

            character_state_update_timer = 0
        }
    }

    export function battle_update(character: Character) {

    }

    export function open_shop(character: Character) {
        character.open_shop = true;
        character.equip.data.backpack.limit = 100
    }

    export function close_shop(character: Character) {
        character.open_shop = false,
        character.equip.data.backpack.limit = 10
    }
}
import { materials, material_index } from "../manager_classes/materials_manager";
import { cell_id, damage_type, money, weapon_attack_tag, weapon_tag } from "../types";
import { Equip } from "../inventories/equip";
import { Savings } from "../inventories/savings";
import { Stash } from "../inventories/stash";
import { damage_types, DmgOps } from "../damage_types";
import { Damage } from "../Damage";
import { Character } from "./character";
import { Loot } from "../races/generate_loot";
import { CharacterTemplate } from "./templates";
import { Data } from "../data";
import { CampaignAI } from "../AI/ai_manager";
import { trim } from "../calculations/basic_functions";
import { Effect } from "../events/effects";
var ai_campaign_decision_timer = 0

export namespace CharacterSystem {
    export function template_to_character(template: CharacterTemplate, name: string|undefined, cell_id: cell_id) {
        Data.CharacterDB.increase_id()
        if (name == undefined) name = template.name_generator();
        let character = new Character(Data.CharacterDB.id(), -1, -1, '#', cell_id, name, template.archetype, template.stats, template.max_hp)
        character.stats.base_resists = DmgOps.add(character.stats.base_resists, template.base_resists);
        Data.CharacterDB.set(Data.CharacterDB.id(), character)
        character.explored[cell_id] = true
        return character
    }

    export function transfer_savings(A: Character, B: Character, x: money) {
        A.savings.transfer(B.savings, x)
    }

    export function transfer_stash(A: Character, B:Character, what: material_index, amount: number) {
        A.stash.transfer(B.stash, what, amount)
    }

    export function to_trade_stash(A: Character, material: material_index, amount: number) {
        if (amount > 0) {
            if (A.stash.get(material) < amount) return false
            A.stash.transfer(A.trade_stash, material, amount)
            return true
        }

        if (amount < 0) {
            if (A.trade_stash.get(material) < -amount) return false
            A.trade_stash.transfer(A.stash, material, -amount)
            return true
        }

        return true
    }

    export function to_trade_savings(A: Character, amount: money) {
        if (amount > 0) {
            if (A.savings.get() < amount) return false
            A.savings.transfer(A.trade_savings, amount)
            return true
        }

        if (amount < 0) {
            if (A.trade_savings.get() < -amount) return false
            A.trade_savings.transfer(A.savings, -amount as money)
            return true
        }

        return true
    }

    export function transaction(        A: Character, B: Character, 
                                        savings_A_to_B: money, stash_A_to_B: Stash, 
                                        savings_B_to_A: money, stash_B_to_A: Stash) 
    {
        // transaction validation
        if (A.savings.get() < savings_A_to_B) return false
        if (B.savings.get() < savings_B_to_A) return false
        
        for (let material of materials.get_materials_list()) {
            if (A.stash.get(material) < stash_A_to_B.get(material)) return false
            if (B.stash.get(material) < stash_B_to_A.get(material)) return false
        }


        //transaction is validated, execution
        A.savings.transfer(B.savings, savings_A_to_B)
        B.savings.transfer(A.savings, savings_B_to_A)

        for (let material of materials.get_materials_list()) {
            A.stash.transfer(B.stash, material, stash_A_to_B.get(material))
            B.stash.transfer(A.stash, material, stash_B_to_A.get(material))
        }
        return true
    }

    export function melee_damage_raw(character: Character, type: damage_type) {
        const weapon_damage = character.equip.get_melee_damage(type)
        if (weapon_damage != undefined) {
            if (character.perks.advanced_polearm) {
                if (CharacterSystem.weapon_type(character) == 'polearms') {
                    DmgOps.mult_ip(weapon_damage, 1.5)
                }
            }
            return weapon_damage
        }

        //handle case of unarmed
        const damage = new Damage()
        if (type == 'blunt')    {
            if (character.perks.advanced_unarmed) {damage.blunt = 40} else {damage.blunt = 15}
        }
        if (type == 'slice')    {
            if (character.perks.claws) {damage.slice = 20} else {damage.slice = 2}
        }
        if (type == 'pierce')   {damage.pierce  = 0}
        return damage
    }

    export function ranged_damage_raw(character: Character) {
        const damage = character.equip.get_ranged_damage()
        if (damage != undefined) return damage
        return new Damage()
    }

    export function ranged_skill(character: Character) {
        let base = character.skills.ranged
        const rage_mod = (100 - character.get_rage()) / 100
        const stress_mod = (100 - character.get_stress()) / 100
        return Math.round(base * rage_mod * stress_mod)
    }

    export function phys_power(character: Character) {
        let base = character.stats.stats.phys_power
        base += character.skills.travelling / 30
        base += character.skills.noweapon / 50
        base += character.skills.fishing / 50
        base += character.skills.ranged / 60
        base += character.skills.woodwork / 40
        base += (character.skills.onehand + character.skills.polearms + character.skills.twohanded) / 50
        return Math.floor(base * character.equip.get_phys_power_modifier())
    }

    export function magic_power(character: Character) {
        let result = character.stats.stats.magic_power + character.equip.get_magic_power()
        if (character.perks.mage_initiation) result += 5
        if (character.perks.magic_bolt) result += 3
        if (character.perks.blood_mage) {
            const blood_mod = character.status.blood / 50
            result = Math.round(result * (1 + blood_mod))
        }
        return result
    }

    export function enchant_rating(character: Character): number {
        let enchant_rating = CharacterSystem.magic_power(character) * (1 + character.skills.magic_mastery / 100 )
        // so it's ~15 at 50 magic mastery
        // and 1 at 20 magic mastery
        if (character.perks.mage_initiation) {
            enchant_rating = enchant_rating * 2
        }

        return enchant_rating
    }

    function movement_speed_battle(character: Character): number {
        let speed = character.stats.stats.movement_speed
        speed = speed * (2 - character.get_fatigue() / 100) * boots_speed_multiplier(character)

        return speed
    }

    export function movement_cost_battle(character: Character): number {
        return (2.5 / movement_speed_battle(character))
    }

    export function boots_speed_multiplier(character: Character): number {
        let base = 0.75

        if (character.equip.data.armour.foot != undefined) {
            base = base + character.equip.data.armour.foot.durability / 200
        }

        return base
    }

    export function movement_duration_map(character: Character): number {
        let duration = 1
        duration += character.get_fatigue() / 100
        duration = duration / boots_speed_multiplier(character)
        duration = duration * (1 - character.skills.travelling / 200)

        return duration
    }

    export function attack_skill(character: Character) {
        const weapon = character.equip.data.weapon
        let skill = 0
        if (weapon == undefined) skill = character.skills.noweapon
        else skill = character.skills[weapon.weapon_tag]
        
        const rage_mod = (100 - character.get_rage()) / 100
        const stress_mod = (100 - character.get_stress()) / 100

        return Math.round(skill * rage_mod * stress_mod)
    }

    export function resistance(character: Character) {
        let result = character.stats.base_resists
        result = DmgOps.add(result, character.equip.resists())
        return result
    }

    export function weapon_type(character: Character):weapon_attack_tag {
        const weapon = character.equip.data.weapon
        if (weapon == undefined) return 'noweapon'
        return weapon.weapon_tag
    }

    export function melee_weapon_type(character: Character):weapon_attack_tag {
        const weapon = character.equip.data.weapon
        if (weapon == undefined) return 'noweapon'
        if (weapon.weapon_tag == 'ranged') return 'polearms'
        return weapon.weapon_tag
    }


    /**
     * Damages character, accounting for resistances
     * @param character Damaged character
     * @param damage damage
     * @returns total damage dealt
     */
    export function damage(character: Character, damage: Damage) {
        let total = 0
        let resistance = CharacterSystem.resistance(character)
        for (let tag of damage_types) {
            const damage_curr = trim(damage[tag] - resistance[tag], 0, 100000)
            character.change_hp(-damage_curr)
            total += damage_curr
        }
        return total
    }

    export function transfer_all(origin:{stash: Stash, savings: Savings, equip: Equip}, target: {stash: Stash, savings: any, equip: any}) {
        origin.stash.transfer_all(target.stash)
        origin.savings.transfer_all(target.savings)
        origin.equip.transfer_all(target)
    }

    export function rgo_check(character: Character):{material: material_index, amount: number}[] {
        const loot = Loot.base(character.archetype.model)
        return loot
    }

    export function update(dt: number) {
        ai_campaign_decision_timer += dt

        if (ai_campaign_decision_timer > 8) {
            for (let character of Data.CharacterDB.list()) {
                if (character.dead()) {
                    continue
                }
                if (Math.random() > 0.6) {
                    CampaignAI.decision(character)
                }                
            }
            ai_campaign_decision_timer = 0
        }

        
        for (let character of Data.CharacterDB.list()) {
            if (character.dead()) {
                continue
            }
            if (!character.in_battle()) Effect.Change.rage(character, -1)
        }
    }

    export function battle_update(character: Character) {

    }
}
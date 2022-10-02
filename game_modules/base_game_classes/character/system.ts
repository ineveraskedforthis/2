import { materials, material_index } from "../../manager_classes/materials_manager";
import { cell_id, char_id, damage_type, money, weapon_attack_tag, weapon_tag } from "../../types";
import { Equip } from "../inventories/equip";
import { Savings } from "../inventories/savings";
import { Stash } from "../inventories/stash";
import { Damage, damage_types } from "../misc/damage_types";
import { Character } from "./character";
import { Loot } from "./races/generate_loot";
import { CharacterTemplate } from "./templates";
import fs from "fs"

var last_character_id = 0
export var character_list:Character[]                  = []
var characters_dict:{[_ in char_id]: Character} = {}


export namespace CharacterSystem {
    export function load() {

    }

    export function save() {
        console.log('saving characters')
        let str:string = ''
        for (let item of character_list) {
            

            str = str + character_to_string(item) + '\n' 
        }
        fs.writeFileSync('characters.txt', str)
        console.log('characteres saved')
    }

    export function character_to_string(c: Character) {
        let responce = ''
        let ids = [c.id, c.battle_id, c.battle_unit_id, c.user_id, c.cell_id].join()
        let name = c.name

        let archetype = JSON.stringify(c.archetype)

        let equip               = JSON.stringify(c.equip.get_json())
        let stash               = JSON.stringify(c.stash.get_json())
        let trade_stash         = JSON.stringify(c.trade_stash.get_json())
        let savings             = c.savings.get()
        let trade_savings       = c.savings.get()



    }

    export function string_to_character(s: string) {

    }

    export function template_to_character(template: CharacterTemplate, name: string|undefined, cell_id: cell_id) {
        last_character_id = last_character_id + 1
        if (name == undefined) name = template.name_generator()
        let character = new Character(last_character_id, -1, -1, '#', cell_id, name, template.archetype, template.stats, template.max_hp)
        character.stats.base_resists.add(template.base_resists)
        characters_dict[character.id] = character
        character_list.push(character)
        character.explored[cell_id] = true
        return character
    }

    export function id_to_character(id: char_id): Character {
        return characters_dict[id]
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
        if (weapon_damage != undefined) return weapon_damage

        //handle case of unarmed
        const damage = new Damage()
        if (type == 'blunt')    {
            if (character.perks.advanced_unarmed) {damage.blunt = 15} else {damage.blunt = 5}
        }
        if (type == 'slice')    {
            if (character.perks.claws) {damage.slice = 15} else {damage.slice = 2}
        }
        if (type == 'pierce')   {damage.pierce  = 0}
        return damage
    }
    export function ranged_damage_raw(character: Character) {
        const damage = character.equip.get_ranged_damage()
        if (damage != undefined) return damage
        return new Damage()
    }

    export function phys_power(character: Character) {
        return character.stats.stats.phys_power + character.equip.get_phys_power_modifier()
    }

    export function attack_skill(character: Character) {
        const weapon = character.equip.data.weapon
        if (weapon == undefined) return character.skills.noweapon
        return character.skills[weapon.weapon_tag]
    }

    export function resistance(character: Character) {
        const result = character.stats.base_resists
        result.add(character.equip.resists())
        return result
    }

    export function weapon_type(character: Character):weapon_attack_tag {
        const weapon = character.equip.data.weapon
        if (weapon == undefined) return 'noweapon'
        return weapon.weapon_tag
    }

    export function damage(character: Character, damage: Damage) {
        let total = 0
        for (let tag of damage_types) {
            character.change_hp(-damage[tag])
            total += damage[tag]
        }
        return total
    }

    export function transfer_all(origin:{stash: Stash, savings: Savings, equip: Equip}, target: {stash: Stash, savings: any, equip: any}) {
        origin.stash.transfer_all(target.stash)
        origin.savings.transfer_all(target.savings)
        origin.equip.transfer_all(target)
    }

    export function rgo_check(character: Character):{material: material_index, amount: number}[] {
        const loot = Loot.base(character.archetype.race)
        return loot
    }

//     mod_spell_damage_with_stats(result: AttackResult, tag:spell_tags) {
//         let power_mod = this.get_magic_power() / 10
//         let skill_mod = this.skills.magic_mastery / 10
//         let damage_mod = power_mod * (skill_mod + 1)

//         if (this.skills.perks.magic_bolt) {
//             damage_mod = damage_mod * 1.5
//         }

//         if (this.skills.perks.mage_initiation) {
//             damage_mod = damage_mod * 1.5
//         }

//         damage_mod = Math.floor(damage_mod)

//         result.damage['blunt']  = Math.floor(Math.max(1, result.damage['blunt']     * damage_mod));
//         result.damage['pierce'] = Math.floor(Math.max(0, result.damage['pierce']    * damage_mod));
//         result.damage['slice']  = Math.floor(Math.max(0, result.damage['slice']     * damage_mod));
//         result.damage['fire']   = Math.floor(Math.max(0, result.damage['fire']      * damage_mod));

//         return result
//     }

//     roll_accuracy(result: AttackResult, mod: 'fast'|'heavy'|'usual'|'ranged', distance?: number) {
//         let dice = Math.random();

//         result.chance_to_hit = this.get_accuracy(result, mod, distance)
        
//         if (dice > result.chance_to_hit) {
//             result.flags.miss = true;
//         }

//         return result
//     }

//     roll_crit(result: AttackResult) {
//         let dice = Math.random()

//         let crit_chance = this.get_crit_chance("attack");
//         let mult = this.get_crit_mult();

//         if (dice < crit_chance) {
//             result.damage['blunt'] = result.damage['blunt'] * mult;
//             result.damage['pierce'] = result.damage['pierce'] * mult;
//             result.damage['slice'] = result.damage['slice'] * mult;
//             result.flags.crit = true;
//         }

//         return result
//     }

//     roll_dodge(result: AttackResult, mod: 'fast'|'heavy'|'usual'|'ranged', dodge_flag: boolean) {
//         let dice = Math.random()

//         let base_evade_chance = this.get_evasion_chance();
//         let attack_specific_dodge = 0;

//         if (dodge_flag) switch(mod){
//             case 'fast': {attack_specific_dodge = 0.2; break}
//             case 'usual': {attack_specific_dodge = 0.5; break}
//             case 'heavy': {attack_specific_dodge = 1; break}
//             case 'ranged': {attack_specific_dodge = 0.2;break}
//         }

//         let evade_chance = base_evade_chance + attack_specific_dodge

//         if (dice < evade_chance) {
//             result.flags.evade = true
//             result.flags.crit = false
//         }

//         return result
//     }

//     roll_block(result: AttackResult) {
//         let dice = Math.random()

//         let block_chance = this.get_block_chance();

//         if (dice < block_chance) {
//             result.flags.blocked = true;
//         }

//         return result;
//     }

    export function update(dt: number) {
        

        // await this.status_check(pool);

        // if (this.flags.dead) {
        //     return
        // }
        
        // if (!this.in_battle()) {
        //     this.out_of_battle_update(dt)
        //     this.update_action_progress(dt);
        //     this.update_visited()
        // } else {
        //     this.battle_update()      
        // }
        // let cell = this.get_cell()
        // if (cell != undefined) {
        //     cell.visit()
            
        // }

        // this.flags_handling_update();
    }

}
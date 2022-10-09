import { Accuracy } from "./base_game_classes/battle/battle_calcs";
import { Attack } from "./base_game_classes/character/attack/system";
import { Character } from "./base_game_classes/character/character";
import { Loot } from "./base_game_classes/character/races/generate_loot";
import { CharacterSystem } from "./base_game_classes/character/system";
import { CharacterTemplate } from "./base_game_classes/character/templates";
import { UI_Part } from "./client_communication/causality_graph";
import { Alerts } from "./client_communication/network_actions/alerts";
import { UserManagement } from "./client_communication/user_manager";
import { ARROW_BONE, material_index, RAT_SKIN } from "./manager_classes/materials_manager";
import { MapSystem } from "./map/system";
import { Convert, Link, Unlink } from "./systems_communication";
import { cell_id, damage_type, weapon_attack_tag } from "./types";

export namespace Event {

    export function new_character(template:CharacterTemplate, name: string, starting_cell: cell_id, model: any) {
        let character = CharacterSystem.template_to_character(template, name, starting_cell)
        character.set_model_variation(model)
        const cell = MapSystem.SAFE_id_to_cell(starting_cell)
        Link.character_and_cell(character, cell)
        return character
    }

    export function shoot(attacker: Character, defender: Character, distance: number): 'ok'|'no_ammo'|'miss' {
        // sanity checks
        if (defender.get_hp() == 0) return 'miss'
        if (attacker.get_hp() == 0) return 'miss'
        if (attacker.stash.get(ARROW_BONE) < 1) {Alerts.not_enough_to_character(attacker, 'arrow', 1, 0); return 'no_ammo'}

        //remove arrow
        change_stash(attacker, ARROW_BONE, -1)

        //check missed attack before everything else
        const acc = Accuracy.ranged(attacker, distance)
        const dice_accuracy = Math.random()
        if (dice_accuracy > acc) { 
            const dice_skill_up = Math.random()
            if (dice_skill_up > attacker.skills.ranged) {
                increase_weapon_skill(attacker, 'ranged')
            }
            return 'miss' 
        }

        // create attack
        const attack = Attack.generate_ranged(attacker)
        CharacterSystem.damage(defender, attack.damage)
        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS)
        return 'ok'
    }

    export function attack(attacker: Character, defender: Character, dodge_flag: boolean, attack_type: damage_type) {
        if (defender.get_hp() == 0) return
        if (attacker.get_hp() == 0) return
        const attack = Attack.generate_melee(attacker, attack_type)
        Attack.defend_against_melee(attack, defender)
        
        {// evasion
            const skill = defender.skills.evasion
            attack.defence_skill += skill

            //active dodge
            if (dodge_flag) {
                attack.flags.miss = true
                Attack.dodge(attack, 50)
                // attempts to evade increase your skill
                if (skill < attack.attack_skill) {
                    increase_evasion(defender)
                }
            }

            //passive evasion
            if (skill > attack.attack_skill) {
                attack.flags.miss = true
                Attack.dodge(attack, skill)
            } else {
                //fighting against stronger enemies provides constant growth of this skill up to some level
                const dice = Math.random()
                if ((dice < 0.01) && (skill <= 15)) {
                    increase_evasion(defender)
                }
            }
        }

        {//block
            const skill = defender.skills.blocking
            attack.defence_skill += skill
            if ((skill > attack.attack_skill)) {
                attack.flags.blocked = true
                increase_evasion(defender)
            }

            //fighting provides constant growth of this skill up to some level
            const dice = Math.random()
            if ((dice < 0.01) && (skill <= 15)) {
                increase_block(defender)
            }
        }

        {//weapon skill update
            if (attack.attack_skill < attack.defence_skill) {
                increase_weapon_skill(attacker, attack.weapon_type)
            }

            //fighting provides constant growth of this skill up to some level
            const dice = Math.random()
            if ((dice < 0.01) && (attack.attack_skill <= 30)) {
                increase_weapon_skill(defender, attack.weapon_type)
            }
        }



        //apply damage after all modifiers
        CharacterSystem.damage(defender, attack.damage)
        defender.change_status(attack.defender_status_change)
        attacker.change_status(attack.attacker_status_change)
        
        UserManagement.add_user_to_update_queue(attacker.user_id, UI_Part.STATUS)
        UserManagement.add_user_to_update_queue(defender.user_id, UI_Part.STATUS)

        //if target is dead, loot it all
        if (defender.get_hp() == 0) {
            const loot = CharacterSystem.rgo_check(defender)
            CharacterSystem.transfer_all(defender, attacker)
            for (const item of loot) {
                attacker.stash.inc(item.material, item.amount)
            }
            // skinning check
            const skin = Loot.skinning(defender.archetype.race)
            if (skin > 0) {
                const dice = Math.random()
                if (dice < attacker.skills.skinning / 100) {
                    attacker.stash.inc(RAT_SKIN, skin)
                } else {
                    increase_skinning(attacker)
                }
            }
            death(defender)
        }
    }

    export function death(character: Character) {
        // UserManagement.add_user_to_update_queue(character.user_id, "death");
        const user_data = Convert.character_to_user_data(character)
        Unlink.user_data_and_character(user_data, character);
    }

    export function increase_evasion(character: Character) {
        character.skills.evasion += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.DEFENCE_SKILL)
    }

    export function increase_block(character: Character) {
        character.skills.blocking += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.DEFENCE_SKILL)
    }

    export function increase_skinning(character: Character) {
        character.skills.skinning += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.SKINNING_SKILL)
    }

    export function increase_weapon_skill(character: Character, skill: weapon_attack_tag) {
        character.skills[skill] += 1
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.WEAPON_SKILL)
    }

    export function change_stash(character: Character, tag: material_index, amount: number) {
        character.stash.inc(tag, amount)
        UserManagement.add_user_to_update_queue(character.user_id, UI_Part.STASH)
    }

    //  spell_attack(target: Character, tag: spell_tags) {
    //     let result = new AttackResult()

    //     if (tag == 'bolt') {
    //         let bolt_difficulty = 30
    //         let dice = Math.random() * bolt_difficulty
    //         let skill = this.skills.magic_mastery
    //         if (skill < dice) {
    //             this.skills.magic_mastery += 1
    //         }
    //     }

    //     result = spells[tag](result);
    //     result = this.mod_spell_damage_with_stats(result, tag);

    //     this.change_status(result.attacker_status_change)

    //     result = await target.take_damage(pool, 'ranged', result);
    //     return result;
    // }

    //  take_damage(mod:'fast'|'heavy'|'usual'|'ranged', result: AttackResult): Promise<AttackResult> {
    //     let res:any = this.get_resists();
        
    //     if (!result.flags.evade && !result.flags.miss) {
    //         for (let i of damage_types) {
    //             if (result.damage[i] > 0) {
    //                 let curr_damage = Math.max(0, result.damage[i] - res[i]);
    //                 if ((curr_damage > 0) && ((i == 'slice') || (i == 'pierce')) && !(mod == 'ranged')) {
    //                     result.attacker_status_change.blood += Math.floor(curr_damage / 10)
    //                     result.defender_status_change.blood += Math.floor(curr_damage / 10)
    //                 }
    //                 result.total_damage += curr_damage;
    //                 this.change_hp(-curr_damage);
    //                 if (this.get_hp() == 0) {
    //                     await this.world.entity_manager.remove_orders(pool, this)
    //                     await AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this)
    //                     result.flags.killing_strike = true
    //                 }
    //             }
    //         }
    //         this.change_status(result.defender_status_change)
    //     }
    //     await this.save_to_db(pool)
    //     return result;
    // }
}
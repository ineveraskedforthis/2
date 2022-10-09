"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const battle_calcs_1 = require("./base_game_classes/battle/battle_calcs");
const system_1 = require("./base_game_classes/character/attack/system");
const generate_loot_1 = require("./base_game_classes/character/races/generate_loot");
const system_2 = require("./base_game_classes/character/system");
const alerts_1 = require("./client_communication/network_actions/alerts");
const user_manager_1 = require("./client_communication/user_manager");
const materials_manager_1 = require("./manager_classes/materials_manager");
const system_3 = require("./map/system");
const systems_communication_1 = require("./systems_communication");
var Event;
(function (Event) {
    function new_character(template, name, starting_cell, model) {
        let character = system_2.CharacterSystem.template_to_character(template, name, starting_cell);
        character.set_model_variation(model);
        const cell = system_3.MapSystem.SAFE_id_to_cell(starting_cell);
        systems_communication_1.Link.character_and_cell(character, cell);
        system_2.CharacterSystem.save();
        return character;
    }
    Event.new_character = new_character;
    function shoot(attacker, defender, distance) {
        // sanity checks
        if (defender.get_hp() == 0)
            return 'miss';
        if (attacker.get_hp() == 0)
            return 'miss';
        if (attacker.stash.get(materials_manager_1.ARROW_BONE) < 1) {
            alerts_1.Alerts.not_enough_to_character(attacker, 'arrow', 1, 0);
            return 'no_ammo';
        }
        //remove arrow
        change_stash(attacker, materials_manager_1.ARROW_BONE, -1);
        //check missed attack before everything else
        const acc = battle_calcs_1.Accuracy.ranged(attacker, distance);
        const dice_accuracy = Math.random();
        if (dice_accuracy > acc) {
            const dice_skill_up = Math.random();
            if (dice_skill_up > attacker.skills.ranged) {
                increase_weapon_skill(attacker, 'ranged');
            }
            return 'miss';
        }
        // create attack
        const attack = system_1.Attack.generate_ranged(attacker);
        system_2.CharacterSystem.damage(defender, attack.damage);
        user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 1 /* UI_Part.STATUS */);
        return 'ok';
    }
    Event.shoot = shoot;
    function attack(attacker, defender, dodge_flag, attack_type) {
        if (defender.get_hp() == 0)
            return;
        if (attacker.get_hp() == 0)
            return;
        const attack = system_1.Attack.generate_melee(attacker, attack_type);
        system_1.Attack.defend_against_melee(attack, defender);
        { // evasion
            const skill = defender.skills.evasion;
            attack.defence_skill += skill;
            //active dodge
            if (dodge_flag) {
                attack.flags.miss = true;
                system_1.Attack.dodge(attack, 50);
                // attempts to evade increase your skill
                if (skill < attack.attack_skill) {
                    increase_evasion(defender);
                }
            }
            //passive evasion
            if (skill > attack.attack_skill) {
                attack.flags.miss = true;
                system_1.Attack.dodge(attack, skill);
            }
            else {
                //fighting against stronger enemies provides constant growth of this skill up to some level
                const dice = Math.random();
                if ((dice < 0.01) && (skill <= 15)) {
                    increase_evasion(defender);
                }
            }
        }
        { //block
            const skill = defender.skills.blocking;
            attack.defence_skill += skill;
            if ((skill > attack.attack_skill)) {
                attack.flags.blocked = true;
                increase_evasion(defender);
            }
            //fighting provides constant growth of this skill up to some level
            const dice = Math.random();
            if ((dice < 0.01) && (skill <= 15)) {
                increase_block(defender);
            }
        }
        { //weapon skill update
            if (attack.attack_skill < attack.defence_skill) {
                increase_weapon_skill(attacker, attack.weapon_type);
            }
            //fighting provides constant growth of this skill up to some level
            const dice = Math.random();
            if ((dice < 0.01) && (attack.attack_skill <= 30)) {
                increase_weapon_skill(defender, attack.weapon_type);
            }
        }
        //apply damage after all modifiers
        system_2.CharacterSystem.damage(defender, attack.damage);
        defender.change_status(attack.defender_status_change);
        attacker.change_status(attack.attacker_status_change);
        user_manager_1.UserManagement.add_user_to_update_queue(attacker.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 1 /* UI_Part.STATUS */);
        //if target is dead, loot it all
        if (defender.get_hp() == 0) {
            const loot = system_2.CharacterSystem.rgo_check(defender);
            system_2.CharacterSystem.transfer_all(defender, attacker);
            for (const item of loot) {
                attacker.stash.inc(item.material, item.amount);
            }
            // skinning check
            const skin = generate_loot_1.Loot.skinning(defender.archetype.race);
            if (skin > 0) {
                const dice = Math.random();
                if (dice < attacker.skills.skinning / 100) {
                    attacker.stash.inc(materials_manager_1.RAT_SKIN, skin);
                }
                else {
                    increase_skinning(attacker);
                }
            }
            death(defender);
        }
    }
    Event.attack = attack;
    function death(character) {
        // UserManagement.add_user_to_update_queue(character.user_id, "death");
        const user_data = systems_communication_1.Convert.character_to_user_data(character);
        systems_communication_1.Unlink.user_data_and_character(user_data, character);
    }
    Event.death = death;
    function increase_evasion(character) {
        character.skills.evasion += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 13 /* UI_Part.DEFENCE_SKILL */);
    }
    Event.increase_evasion = increase_evasion;
    function increase_block(character) {
        character.skills.blocking += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 13 /* UI_Part.DEFENCE_SKILL */);
    }
    Event.increase_block = increase_block;
    function increase_skinning(character) {
        character.skills.skinning += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 15 /* UI_Part.SKINNING_SKILL */);
    }
    Event.increase_skinning = increase_skinning;
    function increase_weapon_skill(character, skill) {
        character.skills[skill] += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 14 /* UI_Part.WEAPON_SKILL */);
    }
    Event.increase_weapon_skill = increase_weapon_skill;
    function change_stash(character, tag, amount) {
        character.stash.inc(tag, amount);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
    }
    Event.change_stash = change_stash;
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
})(Event = exports.Event || (exports.Event = {}));

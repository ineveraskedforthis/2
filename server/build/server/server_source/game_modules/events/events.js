"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Event = void 0;
const helpers_1 = require("../AI/helpers");
const battle_calcs_1 = require("../battle/battle_calcs");
const events_1 = require("../battle/events");
const system_1 = require("../battle/system");
const basic_functions_1 = require("../calculations/basic_functions");
const system_2 = require("../attack/system");
const generate_loot_1 = require("../races/generate_loot");
const Perks_1 = require("../character/Perks");
const system_3 = require("../character/system");
const alerts_1 = require("../client_communication/network_actions/alerts");
const user_manager_1 = require("../client_communication/user_manager");
const data_1 = require("../data");
const materials_manager_1 = require("../manager_classes/materials_manager");
const system_4 = require("../map/system");
const systems_communication_1 = require("../systems_communication");
const effects_1 = require("./effects");
const inventory_events_1 = require("./inventory_events");
const market_1 = require("./market");
var Event;
(function (Event) {
    function buy_perk(student, perk, teacher) {
        let savings = student.savings.get();
        let price = (0, Perks_1.perk_price)(perk, student, teacher);
        if (savings < price) {
            alerts_1.Alerts.not_enough_to_character(student, 'money', price, savings);
            return;
        }
        let responce = (0, Perks_1.perk_requirement)(perk, student);
        if (responce != 'ok') {
            alerts_1.Alerts.generic_character_alert(student, 'alert', responce);
            return;
        }
        student.savings.transfer(teacher.savings, price);
        user_manager_1.UserManagement.add_user_to_update_queue(student.user_id, 5 /* UI_Part.SAVINGS */);
        user_manager_1.UserManagement.add_user_to_update_queue(teacher.user_id, 5 /* UI_Part.SAVINGS */);
        effects_1.Effect.learn_perk(student, perk);
    }
    Event.buy_perk = buy_perk;
    function move(character, new_cell) {
        // console.log('Character moves to ' + new_cell.x + ' ' + new_cell.y)
        const old_cell = systems_communication_1.Convert.character_to_cell(character);
        systems_communication_1.Unlink.character_and_cell(character, old_cell);
        systems_communication_1.Link.character_and_cell(character, new_cell);
        let probability = 0.5;
        if (old_cell.development.wild > 0)
            probability += 0.1;
        if (old_cell.development.wild > 1)
            probability += 0.1;
        if (old_cell.development.urban > 0)
            probability -= 0.2;
        if (old_cell.development.rural > 0)
            probability -= 0.1;
        // effect on fatigue depending on boots
        if (character.equip.data.armour.foot == undefined) {
            character.change('fatigue', 5);
        }
        else {
            const durability = character.equip.data.armour.foot.durability;
            character.change('fatigue', Math.round((0, basic_functions_1.trim)(5 - 4 * (durability / 100), 1, 5)));
        }
        const dice = Math.random();
        if (dice < probability) {
            effects_1.Effect.change_durability(character, 'foot', -1);
            let skill_dice = Math.random();
            if (skill_dice * skill_dice * skill_dice > character.skills.travelling / 100) {
                effects_1.Effect.Change.skill(character, 'travelling', 1);
            }
        }
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 7 /* UI_Part.MAP */);
    }
    Event.move = move;
    function new_character(template, name, starting_cell, model) {
        let character = system_3.CharacterSystem.template_to_character(template, name, starting_cell);
        if (model == undefined)
            model = { chin: 0, mouth: 0, eyes: 0 };
        character.set_model_variation(model);
        const cell = system_4.MapSystem.SAFE_id_to_cell(starting_cell);
        systems_communication_1.Link.character_and_cell(character, cell);
        system_3.CharacterSystem.save();
        return character;
    }
    Event.new_character = new_character;
    function ranged_dodge(attacker, defender, flag_dodge) {
        // evasion helps against arrows better than in melee
        // 100 evasion - 2 * attack skill = 100% of arrows are missing
        // evaded attack does not rise skill of attacker
        // dodge is an active evasion
        // it gives base 20% of arrows missing
        // and you rise your evasion if you are attacked
        const attack_skill = 2 * attacker.skills.ranged;
        const evasion = defender.skills.evasion;
        let evasion_chance = evasion - attack_skill;
        if (flag_dodge)
            evasion_chance = evasion_chance + 0.1;
        if (flag_dodge) {
            const dice_evasion_skill_up = Math.random();
            if (dice_evasion_skill_up < attack_skill - evasion) {
                increase_evasion(defender);
            }
        }
        const evasion_roll = Math.random();
        if (evasion_roll < evasion_chance) {
            return 'miss';
        }
    }
    function shoot(attacker, defender, distance, flag_dodge) {
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
        //check missed attack because of lack of skill
        const acc = battle_calcs_1.Accuracy.ranged(attacker, distance);
        const dice_accuracy = Math.random();
        if (dice_accuracy > acc) {
            const dice_skill_up = Math.random();
            if (dice_skill_up * 100 > attacker.skills.ranged) {
                increase_weapon_skill(attacker, 'ranged');
            }
            return 'miss';
        }
        const responce = ranged_dodge(attacker, defender, flag_dodge);
        if (responce == 'miss') {
            return 'miss';
        }
        // durability changes
        const roll_weapon = Math.random();
        if (roll_weapon < 0.2) {
            effects_1.Effect.change_durability(attacker, 'weapon', -1);
        }
        {
            const roll = Math.random();
            if (roll < 0.5)
                effects_1.Effect.change_durability(defender, 'body', -1);
            else if (roll < 0.7)
                effects_1.Effect.change_durability(defender, 'legs', -1);
            else if (roll < 0.8)
                effects_1.Effect.change_durability(defender, 'foot', -1);
            else if (roll < 0.9)
                effects_1.Effect.change_durability(defender, 'head', -1);
            else
                effects_1.Effect.change_durability(defender, 'arms', -1);
        }
        // create attack
        const attack = system_2.Attack.generate_ranged(attacker);
        system_3.CharacterSystem.damage(defender, attack.damage);
        user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 1 /* UI_Part.STATUS */);
        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender);
        }
        return 'ok';
    }
    Event.shoot = shoot;
    function magic_bolt(attacker, defender, flag_dodge) {
        if (defender.dead())
            return 'miss';
        if (attacker.dead())
            return 'miss';
        const BLOOD_COST = 10;
        // managing costs
        if (attacker.stash.get(materials_manager_1.ZAZ) > 0)
            attacker.stash.inc(materials_manager_1.ZAZ, -1);
        else if (attacker.status.blood >= BLOOD_COST)
            attacker.status.blood -= BLOOD_COST;
        else {
            const blood = attacker.status.blood;
            const hp = attacker.status.hp;
            if (blood + hp > BLOOD_COST) {
                attacker.status.blood = 0;
                attacker.status.hp -= (BLOOD_COST - blood);
            }
            else {
                attacker.status.hp = 1;
            }
        }
        const dice = Math.random();
        if (dice > attacker.skills.magic_mastery / 50) {
            effects_1.Effect.Change.skill(attacker, 'magic_mastery', 1);
        }
        const attack = system_2.Attack.generate_magic_bolt(attacker);
        system_3.CharacterSystem.damage(defender, attack.damage);
        user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(attacker.user_id, 1 /* UI_Part.STATUS */);
        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender);
        }
        return 'ok';
    }
    Event.magic_bolt = magic_bolt;
    function attack(attacker, defender, dodge_flag, attack_type) {
        if (attacker.dead())
            return;
        if (defender.dead())
            return;
        const attack = system_2.Attack.generate_melee(attacker, attack_type);
        system_2.Attack.defend_against_melee(attack, defender);
        data_1.Data.Reputation.set_a_X_b(defender.id, 'enemy', attacker.id);
        { // evasion
            const skill = defender.skills.evasion + Math.round(Math.random() * 2);
            attack.defence_skill += skill;
            //active dodge
            if (dodge_flag) {
                attack.flags.miss = true;
                system_2.Attack.dodge(attack, 50);
                // attempts to evade increase your skill
                if (skill < attack.attack_skill) {
                    increase_evasion(defender);
                }
            }
            //passive evasion
            if (skill > attack.attack_skill) {
                attack.flags.miss = true;
                system_2.Attack.dodge(attack, skill);
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
            const skill = defender.skills.blocking + Math.round(Math.random() * 2);
            attack.defence_skill += skill;
            if ((skill > attack.attack_skill)) {
                attack.flags.blocked = true;
                let dice = Math.random();
                if (dice * 100 > skill)
                    increase_block(defender);
            }
            system_2.Attack.block(attack, skill);
            //fighting provides constant growth of this skill up to some level
            const dice = Math.random();
            if ((dice < 0.01) && (skill <= 15)) {
                increase_block(defender);
            }
        }
        { //weapon mastery
            const weapon = system_3.CharacterSystem.melee_weapon_type(defender);
            const skill = defender.skills[weapon] + Math.round(Math.random() * 2);
            attack.defence_skill += skill;
            if ((skill > attack.attack_skill)) {
                attack.flags.blocked = true;
                let dice = Math.random();
                if (dice * 100 > skill)
                    effects_1.Effect.Change.skill(defender, weapon, 1);
            }
            //fighting provides constant growth of this skill up to some level
            const dice = Math.random();
            if ((dice < 0.02) && (skill <= 20)) {
                effects_1.Effect.Change.skill(defender, weapon, 1);
            }
        }
        { //weapon skill update
            // if attacker skill is lower than defence skill, then attacker can improve
            if (attack.attack_skill < attack.defence_skill) {
                const diff = attack.defence_skill - attack.attack_skill;
                const dice = Math.random();
                if (dice * 300 < diff)
                    increase_weapon_skill(attacker, attack.weapon_type);
            }
            //fighting provides constant growth of this skill up to some level
            const dice = Math.random();
            if ((dice < 0.02) && (attack.attack_skill <= 30)) {
                increase_weapon_skill(defender, attack.weapon_type);
            }
            const dice2 = Math.random();
            if ((dice2 < 0.02) && (attack.attack_skill <= 30)) {
                increase_weapon_skill(attacker, attack.weapon_type);
            }
        }
        // durability changes
        if (!attack.flags.miss) {
            const durability_roll = Math.random();
            if (durability_roll < 0.5)
                effects_1.Effect.change_durability(attacker, 'weapon', -1);
            if (attack.flags.blocked) {
                effects_1.Effect.change_durability(defender, 'weapon', -1);
            }
            else {
                const roll = Math.random();
                if (roll < 0.5)
                    effects_1.Effect.change_durability(defender, 'body', -1);
                else if (roll < 0.7)
                    effects_1.Effect.change_durability(defender, 'legs', -1);
                else if (roll < 0.8)
                    effects_1.Effect.change_durability(defender, 'foot', -1);
                else if (roll < 0.9)
                    effects_1.Effect.change_durability(defender, 'head', -1);
                else
                    effects_1.Effect.change_durability(defender, 'arms', -1);
            }
        }
        //apply damage after all modifiers
        // console.log(attack)
        system_3.CharacterSystem.damage(defender, attack.damage);
        defender.change_status(attack.defender_status_change);
        attacker.change_status(attack.attacker_status_change);
        user_manager_1.UserManagement.add_user_to_update_queue(attacker.user_id, 1 /* UI_Part.STATUS */);
        user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 1 /* UI_Part.STATUS */);
        //if target is dead, loot it all
        if (defender.dead()) {
            kill(attacker, defender);
        }
    }
    Event.attack = attack;
    function kill(killer, victim) {
        console.log(killer.name + ' kills ' + victim.name);
        death(victim);
        const loot = system_3.CharacterSystem.rgo_check(victim);
        system_3.CharacterSystem.transfer_all(victim, killer);
        for (const item of loot) {
            killer.stash.inc(item.material, item.amount);
        }
        // console.log(killer.stash.data)
        //loot items rgo
        // console.log('check items drop')
        const dropped_items = generate_loot_1.Loot.items(victim.race());
        for (let item of dropped_items) {
            inventory_events_1.EventInventory.add_item(killer, item);
        }
        // skinning check
        const skin = generate_loot_1.Loot.skinning(victim.archetype.race);
        if (skin > 0) {
            const dice = Math.random();
            if (dice < killer.skills.skinning / 100) {
                killer.stash.inc(materials_manager_1.RAT_SKIN, skin);
            }
            else {
                increase_skinning(killer);
            }
        }
        user_manager_1.UserManagement.add_user_to_update_queue(killer.user_id, 4 /* UI_Part.STASH */);
    }
    Event.kill = kill;
    function death(character) {
        // UserManagement.add_user_to_update_queue(character.user_id, "death");
        if (character.cleared)
            return;
        console.log('death of ' + character.name);
        market_1.EventMarket.clear_orders(character);
        const user_data = systems_communication_1.Convert.character_to_user_data(character);
        systems_communication_1.Unlink.user_data_and_character(user_data, character);
        const battle = systems_communication_1.Convert.character_to_battle(character);
        systems_communication_1.Unlink.character_and_battle(character, battle);
        const cell = systems_communication_1.Convert.character_to_cell(character);
        cell.changed_characters = true;
        systems_communication_1.Unlink.character_and_cell(character, cell);
        character.cleared = true;
    }
    Event.death = death;
    function increase_evasion(character) {
        character.skills.evasion += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 14 /* UI_Part.DEFENCE_SKILL */);
    }
    Event.increase_evasion = increase_evasion;
    function increase_block(character) {
        character.skills.blocking += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 14 /* UI_Part.DEFENCE_SKILL */);
    }
    Event.increase_block = increase_block;
    function increase_skinning(character) {
        character.skills.skinning += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 16 /* UI_Part.SKINNING_SKILL */);
    }
    Event.increase_skinning = increase_skinning;
    function increase_weapon_skill(character, skill) {
        character.skills[skill] += 1;
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 15 /* UI_Part.WEAPON_SKILL */);
    }
    Event.increase_weapon_skill = increase_weapon_skill;
    function change_stash(character, tag, amount) {
        character.stash.inc(tag, amount);
        user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 4 /* UI_Part.STASH */);
    }
    Event.change_stash = change_stash;
    function start_battle(attacker, defender) {
        console.log('attempt to start battle');
        if (attacker.id == defender.id)
            return undefined;
        if (attacker.in_battle())
            return undefined;
        if (attacker.cell_id != defender.cell_id) {
            return undefined;
        }
        console.log('valid participants');
        // two cases
        // if defender is in battle, attempt to join it against him as a new team
        // else create new battle
        const battle = systems_communication_1.Convert.character_to_battle(defender);
        const unit_def = systems_communication_1.Convert.character_to_unit(defender);
        if ((battle != undefined) && (unit_def != undefined)) {
            let team = helpers_1.AIhelper.check_team_to_join(attacker, battle, unit_def.team);
            if (team == 'no_interest')
                team = Math.random();
            join_battle(attacker, battle, team);
        }
        else {
            const battle_id = system_1.BattleSystem.create_battle();
            console.log('new battle: ' + battle_id);
            const battle = systems_communication_1.Convert.id_to_battle(battle_id);
            const attacker_unit = system_1.BattleSystem.create_unit(attacker, 1);
            const defender_unit = system_1.BattleSystem.create_unit(defender, 0);
            events_1.BattleEvent.NewUnit(battle, attacker_unit);
            events_1.BattleEvent.NewUnit(battle, defender_unit);
            systems_communication_1.Link.character_battle_unit(attacker, battle, attacker_unit);
            systems_communication_1.Link.character_battle_unit(defender, battle, defender_unit);
            alerts_1.Alerts.battle_update_data(battle);
            user_manager_1.UserManagement.add_user_to_update_queue(attacker.user_id, 19 /* UI_Part.BATTLE */);
            user_manager_1.UserManagement.add_user_to_update_queue(defender.user_id, 19 /* UI_Part.BATTLE */);
        }
    }
    Event.start_battle = start_battle;
    function join_battle(agent, battle, team) {
        if (agent.in_battle()) {
            return;
        }
        const unit = system_1.BattleSystem.create_unit(agent, team);
        events_1.BattleEvent.NewUnit(battle, unit);
        systems_communication_1.Link.character_battle_unit(agent, battle, unit);
        user_manager_1.UserManagement.add_user_to_update_queue(agent.user_id, 19 /* UI_Part.BATTLE */);
    }
    Event.join_battle = join_battle;
    function stop_battle(battle) {
        battle.ended = true;
        for (let unit of battle.heap.raw_data) {
            const character = systems_communication_1.Convert.unit_to_character(unit);
            if (character != undefined) {
                character.battle_id = -1;
                character.battle_unit_id = -1;
            }
            user_manager_1.UserManagement.add_user_to_update_queue(character.user_id, 19 /* UI_Part.BATTLE */);
        }
    }
    Event.stop_battle = stop_battle;
    function on_craft_update(character, skill, craft_tier) {
        const dice = Math.random();
        const current = character.skills[skill];
        // console.log(dice, craft_tier, current, (craft_tier - current) / 100)
        if ((current == 0) || (dice < (craft_tier - current) / 100))
            effects_1.Effect.Change.skill(character, skill, 1);
        effects_1.Effect.Change.stress(character, 1);
        effects_1.Effect.Change.fatigue(character, craft_tier);
    }
    Event.on_craft_update = on_craft_update;
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
    //     result =  target.take_damage(pool, 'ranged', result);
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
    //                      this.world.entity_manager.remove_orders(pool, this)
    //                      AuctionManagement.cancel_all_orders(pool, this.world.entity_manager, this.world.socket_manager, this)
    //                     result.flags.killing_strike = true
    //                 }
    //             }
    //         }
    //         this.change_status(result.defender_status_change)
    //     }
    //      this.save_to_db(pool)
    //     return result;
    // }
})(Event = exports.Event || (exports.Event = {}));
